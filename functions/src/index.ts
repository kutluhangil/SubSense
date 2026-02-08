
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

// initialize Stripe with secret key from environment variables
// Set via: firebase functions:config:set stripe.secret="sk_live_..." stripe.webhook_secret="whsec_..."
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

// PRICE IDs (Replace these with your actual Stripe Price IDs)
const PRICES = {
  month: "price_1Pxxxxx", // $3.99/mo
  year: "price_1Pyyyyy",  // $29.99/yr
};

// 1. Create Checkout Session
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const userId = context.auth.uid;
  const { interval, successUrl, cancelUrl } = data; // interval: 'month' | 'year'
  const priceId = PRICES[interval as keyof typeof PRICES] || PRICES.month;

  try {
    // Get or Create Stripe Customer
    const userDoc = await db.collection("users").doc(userId).get();
    let customerId = userDoc.data()?.plan?.stripeCustomerId;

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
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 2. Create Portal Session (Manage Subscription)
export const createPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const userId = context.auth.uid;
  const { returnUrl } = data;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const customerId = userDoc.data()?.plan?.stripeCustomerId;

    if (!customerId) {
      throw new functions.https.HttpsError("failed-precondition", "No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 3. Webhook Handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUID;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

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
        const subscription = event.data.object as Stripe.Subscription;
        const uid = await getUserIdFromCustomerId(subscription.customer as string);

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
        const subscription = event.data.object as Stripe.Subscription;
        const uid = await getUserIdFromCustomerId(subscription.customer as string);

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
  } catch (err: any) {
    console.error("Webhook processing failed:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Helper to find Firebase User ID by Stripe Customer ID
async function getUserIdFromCustomerId(customerId: string): Promise<string | null> {
  // Ideally, query a reverse mapping or index. 
  // For MVP, we search. In production, store mapping in a separate collection 'customers'.
  const snapshot = await db.collection("users")
    .where("plan.stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

// 4. API (Express App)
import app from "./app";
export const api = functions.https.onRequest(app);
