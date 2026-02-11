"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.searchUsers = exports.stripeWebhook = exports.createPortalSession = exports.createCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
admin.initializeApp();
const db = admin.firestore();
// Initialize Stripe conditionally — if not configured, payment features are disabled
// Set via: firebase functions:config:set stripe.secret="sk_live_..." stripe.webhook_secret="whsec_..."
const stripeConfig = functions.config().stripe;
const stripe = (stripeConfig === null || stripeConfig === void 0 ? void 0 : stripeConfig.secret)
    ? new stripe_1.default(stripeConfig.secret, { apiVersion: "2023-10-16" })
    : null;
// PRICE IDs (Replace these with your actual Stripe Price IDs)
const PRICES = {
    month: "price_1Pxxxxx",
    year: "price_1Pyyyyy", // $29.99/yr
};
// 1. Create Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    if (!stripe) {
        throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured");
    }
    const userId = context.auth.uid;
    const { interval, successUrl, cancelUrl } = data; // interval: 'month' | 'year'
    const priceId = PRICES[interval] || PRICES.month;
    try {
        // Get or Create Stripe Customer
        const userDoc = await db.collection("users").doc(userId).get();
        let customerId = (_b = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: context.auth.token.email,
                metadata: { firebaseUID: userId },
            });
            customerId = customer.id;
            // Save ID immediately
            await db.collection("users").doc(userId).set({
                plan: { stripeCustomerId: customerId }
            }, { merge: true });
        }
        // Create Session
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { firebaseUID: userId },
        });
        return { url: session.url };
    }
    catch (error) {
        console.error("Stripe Session Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// 2. Create Portal Session (Manage Subscription)
exports.createPortalSession = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    if (!stripe) {
        throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured");
    }
    const userId = context.auth.uid;
    const { returnUrl } = data;
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        const customerId = (_b = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.stripeCustomerId;
        if (!customerId) {
            throw new functions.https.HttpsError("failed-precondition", "No subscription found");
        }
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return { url: session.url };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// 3. Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b;
    const signature = req.headers["stripe-signature"];
    const webhookSecret = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret;
    if (!stripe || !webhookSecret) {
        res.status(500).send("Stripe is not configured");
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const uid = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.firebaseUID;
                const subscriptionId = session.subscription;
                const customerId = session.customer;
                if (uid) {
                    // Retrieve the subscription details to get the period end
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    await db.collection("users").doc(uid).set({
                        plan: {
                            type: "pro",
                            status: "active",
                            stripeCustomerId: customerId,
                            stripeSubscriptionId: subscriptionId,
                            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
                            interval: "month" // Simplified, ideally fetch from price object
                        }
                    }, { merge: true });
                }
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const uid = await getUserIdFromCustomerId(subscription.customer);
                if (uid) {
                    const status = subscription.status;
                    const isActive = status === 'active' || status === 'trialing';
                    await db.collection("users").doc(uid).set({
                        plan: {
                            type: isActive ? "pro" : "free",
                            status: status,
                            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
                            cancelAtPeriodEnd: subscription.cancel_at_period_end
                        }
                    }, { merge: true });
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const uid = await getUserIdFromCustomerId(subscription.customer);
                if (uid) {
                    await db.collection("users").doc(uid).set({
                        plan: {
                            type: "free",
                            status: "canceled",
                            stripeSubscriptionId: admin.firestore.FieldValue.delete(),
                            currentPeriodEnd: admin.firestore.FieldValue.delete()
                        }
                    }, { merge: true });
                }
                break;
            }
        }
        res.status(200).send({ received: true });
    }
    catch (err) {
        console.error("Webhook processing failed:", err);
        res.status(500).send("Internal Server Error");
    }
});
// 5. User Search (Secure)
exports.searchUsers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const { searchTerm } = data;
    const callerUid = context.auth.uid;
    if (!searchTerm || typeof searchTerm !== 'string') {
        return [];
    }
    try {
        const usersRef = db.collection('users');
        // Simple email exact match for MVP. 
        // For production, use Algolia or Typesense for "contains" search.
        const qEmail = usersRef.where('email', '==', searchTerm).limit(5);
        const snap = await qEmail.get();
        const results = [];
        snap.forEach((doc) => {
            if (doc.id !== callerUid) {
                const userData = doc.data();
                // Return only safe public info to avoids leaking sensitive data like 'plan' details if unnecessary
                results.push({
                    uid: doc.id,
                    email: userData.email,
                    displayName: userData.displayName,
                    stats: userData.stats || { totalSubscriptions: 0, monthlySpend: 0 },
                    preferences: userData.preferences || { region: 'Unknown', baseCurrency: 'USD' }
                });
            }
        });
        return results;
    }
    catch (error) {
        console.error("Search users error:", error);
        throw new functions.https.HttpsError("internal", "Search failed");
    }
});
// Helper to find Firebase User ID by Stripe Customer ID
async function getUserIdFromCustomerId(customerId) {
    // Ideally, query a reverse mapping or index. 
    // For MVP, we search. In production, store mapping in a separate collection 'customers'.
    const snapshot = await db.collection("users")
        .where("plan.stripeCustomerId", "==", customerId)
        .limit(1)
        .get();
    if (snapshot.empty)
        return null;
    return snapshot.docs[0].id;
}
// 4. API (Express App)
const app_1 = __importDefault(require("./app"));
exports.api = functions.https.onRequest(app_1.default);
//# sourceMappingURL=index.js.map