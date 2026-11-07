import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import { getVerificationEmailTemplate } from "./email/verificationTemplate";
import { initFirebaseAdmin } from "./initAdmin";

initFirebaseAdmin();
const db = admin.firestore();

// 1. User Search (Secure)
export const searchUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const { searchTerm } = data || {};
  const callerUid = context.auth.uid;

  if (!searchTerm || typeof searchTerm !== "string") {
    return [];
  }

  try {
    const usersRef = db.collection("users");
    // Simple email exact match for MVP.
    // For production, use Algolia or Typesense for "contains" search.
    const qEmail = usersRef.where("email", "==", searchTerm).limit(5);
    const snap = await qEmail.get();

    const results: any[] = [];
    snap.forEach((doc) => {
      if (doc.id !== callerUid) {
        const userData = doc.data();
        const preferences = userData.preferences || { region: "Unknown", baseCurrency: "USD" };
        const privacy = preferences.privacy;
        const stats = { ...(userData.stats || { totalSubscriptions: 0, monthlySpend: 0 }) };

        if (privacy?.showSubscriptions === false) {
          stats.totalSubscriptions = 0;
        }
        if (privacy?.showSpending === false) {
          stats.monthlySpend = 0;
        }

        // Return only safe public info to avoid leaking sensitive data
        results.push({
          uid: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          stats,
          preferences,
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Search users error:", error);
    throw new functions.https.HttpsError("internal", "Search failed");
  }
});

// --- EMAIL SYSTEM ---

// Helper: Send Email via Resend
// Set via: RESEND_API_KEY / RESEND_FROM_EMAIL env vars or firebase functions:config:set resend.key="re_..." resend.from="Aboneyim <noreply@aboneyim.app>"
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY || functions.config().resend?.key;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    functions.config().resend?.from ||
    "Aboneyim <onboarding@resend.dev>";

  if (!resendKey) {
    console.warn(
      "Resend API key is not configured (RESEND_API_KEY or resend.key missing). Throwing failed-precondition so client can fall back to standard Firebase verification."
    );
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Email service (Resend) is not configured."
    );
  }

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("Resend Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to send email provider request"
    );
  }
}

// 2. Send Custom Verification Email
export const sendCustomVerificationEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const email = data?.email || context.auth.token.email;
  const redirectUrl =
    data?.redirectUrl ||
    process.env.APP_URL ||
    functions.config().app?.url ||
    "https://subsense.app";

  if (!email || typeof email !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Email is required");
  }

  if (
    context.auth.token.email &&
    email.toLowerCase() !== context.auth.token.email.toLowerCase()
  ) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Cannot send verification email to a different address"
    );
  }

  const resendKey = process.env.RESEND_API_KEY || functions.config().resend?.key;
  if (!resendKey) {
    console.warn(
      "Resend API key is not configured (RESEND_API_KEY or resend.key missing). Falling back to client-side Firebase verification."
    );
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Email service (Resend) is not configured."
    );
  }

  try {
    // 1. Generate the link using Admin SDK
    const link = await admin.auth().generateEmailVerificationLink(email, {
      url: redirectUrl,
      handleCodeInApp: true,
    });

    // 2. Generate the HTML
    const html = getVerificationEmailTemplate(link, "Aboneyim");

    // 3. Send via Resend
    await sendEmail(email, "Verify your email for Aboneyim", html);

    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("Error sending custom verification email:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 3. Revoke All Sessions (Sign out from all devices)
export const revokeAllSessions = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }
  await admin.auth().revokeRefreshTokens(context.auth.uid);
  return { success: true };
});

// 4. Delete User Account (wipes Auth + Firestore)
export const deleteUserAccount = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const uid = context.auth.uid;

  try {
    // Delete all sub-collections in a batch
    const batch = db.batch();

    const collectionsToDelete = ["subscriptions", "friends", "friendRequests", "sentRequests"];
    for (const col of collectionsToDelete) {
      const snap = await db.collection("users").doc(uid).collection(col).get();
      snap.docs.forEach((d) => batch.delete(d.ref));
    }

    // Delete the user document
    batch.delete(db.collection("users").doc(uid));
    await batch.commit();

    // Delete Firebase Auth user (must be last — invalidates token)
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error: any) {
    console.error("Account deletion failed:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 5. API (Express App)
import app from "./app";
export const api = functions.https.onRequest(app);

// ── GEMINI PROXY FUNCTIONS ────────────────────────────────────────────────
// The Gemini API key is stored server-side in environment / Firebase Functions config.
// Set via: GEMINI_API_KEY env var or firebase functions:config:set gemini.key="AIza..."

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiRaw(
  contents: object[],
  systemInstruction?: string,
  responseMimeType?: string
): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  if (!geminiKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Gemini API key is not configured on the server. Set GEMINI_API_KEY or run: firebase functions:config:set gemini.key=\"AIza...\""
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

// 6. Gemini Insights Proxy (single-turn, JSON response — open to all authenticated users)
export const geminiProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to use AI features."
    );
  }

  const { prompt, systemInstruction } = data || {};
  if (!prompt || typeof prompt !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "prompt is required.");
  }
  if (prompt.length > 20000) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "prompt exceeds maximum allowed length (20000 characters)."
    );
  }
  if (
    systemInstruction !== undefined &&
    (typeof systemInstruction !== "string" || systemInstruction.length > 20000)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "systemInstruction exceeds maximum allowed length."
    );
  }

  const text = await callGeminiRaw(
    [{ parts: [{ text: prompt }] }],
    systemInstruction,
    "application/json"
  );

  return { text };
});

// 7. Gemini Chat Proxy (multi-turn conversation — open to all authenticated users)
export const geminiChatProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to use AI features."
    );
  }

  const { history, userMessage, systemInstruction } = data || {};
  if (!userMessage || typeof userMessage !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "userMessage is required.");
  }
  if (userMessage.length > 8000) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userMessage exceeds maximum allowed length (8000 characters)."
    );
  }
  if (history !== undefined && (!Array.isArray(history) || history.length > 40)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "history must be an array with at most 40 entries."
    );
  }
  if (
    systemInstruction !== undefined &&
    (typeof systemInstruction !== "string" || systemInstruction.length > 20000)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "systemInstruction exceeds maximum allowed length."
    );
  }

  const contents = [
    ...(Array.isArray(history) ? history : []),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const text = await callGeminiRaw(contents, systemInstruction);
  return { text };
});

export * from "./calendar";
export * from "./emails";
export * from "./priceSync";
export * from "./friends";
export * from "./referrals";
