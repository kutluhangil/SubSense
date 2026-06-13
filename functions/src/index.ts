
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { getVerificationEmailTemplate } from "./email/verificationTemplate";

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe conditionally — if not configured, payment features are disabled
// Set via: firebase functions:config:set stripe.secret="sk_live_..." stripe.webhook_secret="whsec_..."
const stripeConfig = functions.config().stripe;
const stripe = stripeConfig?.secret
  ? new Stripe(stripeConfig.secret, { apiVersion: "2023-10-16" })
  : null;

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
  if (!stripe) {
    throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured");
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
  if (!stripe) {
    throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured");
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
  const webhookSecret = functions.config().stripe?.webhook_secret;
  if (!stripe || !webhookSecret) {
    res.status(500).send("Stripe is not configured");
    return;
  }

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

// 5. User Search (Secure)
export const searchUsers = functions.https.onCall(async (data, context) => {
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

    const results: any[] = [];
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
  } catch (error) {
    console.error("Search users error:", error);
    throw new functions.https.HttpsError("internal", "Search failed");
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


// --- EMAIL SYSTEM ---

// 6. Send Custom Verification Email
export const sendCustomVerificationEmail = functions.https.onCall(async (data, context) => {
  // Ensure we are authenticated (or we can secure purely by email if needed, but authenticating is safer for rate limits)
  // Actually, for signup flow, user is signed in but unverified.
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const email = data.email || context.auth.token.email;
  const redirectUrl = data.redirectUrl || functions.config().app?.url || 'https://subsense.app';

  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required");
  }

  try {
    // 1. Generate the link using Admin SDK
    // This bypasses the default template and gives us the raw link
    const link = await admin.auth().generateEmailVerificationLink(email, {
      url: redirectUrl,
      handleCodeInApp: true
    });

    // 2. Generate the HTML
    const html = getVerificationEmailTemplate(link, "SubSense");

    // 3. Send via SendGrid (or log if no key)
    await sendEmail(email, "Verify your email for SubSense", html);

    return { success: true };
  } catch (error: any) {
    console.error("Error sending custom verification email:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Helper: Send Email (SendGrid / Log)
// Requires: firebase functions:config:set sendgrid.key="SG.xxx"
async function sendEmail(to: string, subject: string, html: string) {
  const sendgridKey = functions.config().sendgrid?.key;

  if (sendgridKey) {
    // Production: Send via SendGrid API
    // Using fetch (available in Node 18+)
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@subsense.app', name: 'SubSense Team' }, // Update this sender!
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("SendGrid Error:", err);
      throw new Error("Failed to send email provider request");
    }
  } else {
    // Development / No Key: Log it
    console.log(">>> [MOCK EMAIL SENT] >>>");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link logic works. HTML content generated (${html.length} chars).`);
    console.log("Check Firebase Functions logs to confirm trigger.");
    console.log("<<< [MOCK EMAIL END] <<<");
  }
}



// 7. Delete User Account (wipes Auth + Firestore)
export const deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const uid = context.auth.uid;

  try {
    // Delete all sub-collections in a batch
    const batch = db.batch();

    const collectionsToDelete = ['subscriptions', 'friends', 'friendRequests', 'sentRequests'];
    for (const col of collectionsToDelete) {
      const snap = await db.collection('users').doc(uid).collection(col).get();
      snap.docs.forEach(d => batch.delete(d.ref));
    }

    // Delete the user document
    batch.delete(db.collection('users').doc(uid));
    await batch.commit();

    // Delete Firebase Auth user (must be last — invalidates token)
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error: any) {
    console.error("Account deletion failed:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 4. API (Express App)
import app from "./app";
export const api = functions.https.onRequest(app);


// ── GEMINI PROXY FUNCTIONS ────────────────────────────────────────────────
// The Gemini API key is stored server-side in Firebase Functions config.
// Set it via: firebase functions:config:set gemini.key="AIza..."
// This ensures the key NEVER appears in the frontend bundle.

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiRaw(
  contents: object[],
  systemInstruction?: string,
  responseMimeType?: string
): Promise<string | null> {
  const geminiKey = functions.config().gemini?.key;
  if (!geminiKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Gemini API key is not configured on the server. Run: firebase functions:config:set gemini.key=\"AIza...\""
    );
  }

  const body: any = {
    contents,
    generationConfig: responseMimeType ? { responseMimeType } : {},
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API Error:", res.status, errText);
    throw new functions.https.HttpsError("internal", `Gemini API returned ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// 8. Gemini Insights Proxy (single-turn, JSON response)
export const geminiProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in to use AI features.");
  }

  const { prompt, systemInstruction } = data;
  if (!prompt || typeof prompt !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "prompt is required.");
  }

  const text = await callGeminiRaw(
    [{ parts: [{ text: prompt }] }],
    systemInstruction,
    "application/json"
  );

  return { text };
});

// 9. Gemini Chat Proxy (multi-turn conversation)
export const geminiChatProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in to use AI features.");
  }

  const { history, userMessage, systemInstruction } = data;
  if (!userMessage || typeof userMessage !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "userMessage is required.");
  }

  const contents = [
    ...(Array.isArray(history) ? history : []),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const text = await callGeminiRaw(contents, systemInstruction);
  return { text };
});
export * from './calendar';
export * from './emails';
export * from './priceSync';
