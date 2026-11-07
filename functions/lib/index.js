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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiChatProxy = exports.geminiProxy = exports.api = exports.deleteUserAccount = exports.revokeAllSessions = exports.sendCustomVerificationEmail = exports.searchUsers = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
const verificationTemplate_1 = require("./email/verificationTemplate");
const initAdmin_1 = require("./initAdmin");
(0, initAdmin_1.initFirebaseAdmin)();
const db = admin.firestore();
// 1. User Search (Secure)
exports.searchUsers = functions.https.onCall(async (data, context) => {
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
        const results = [];
        snap.forEach((doc) => {
            if (doc.id !== callerUid) {
                const userData = doc.data();
                const preferences = userData.preferences || { region: "Unknown", baseCurrency: "USD" };
                const privacy = preferences.privacy;
                const stats = Object.assign({}, (userData.stats || { totalSubscriptions: 0, monthlySpend: 0 }));
                if ((privacy === null || privacy === void 0 ? void 0 : privacy.showSubscriptions) === false) {
                    stats.totalSubscriptions = 0;
                }
                if ((privacy === null || privacy === void 0 ? void 0 : privacy.showSpending) === false) {
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
    }
    catch (error) {
        console.error("Search users error:", error);
        throw new functions.https.HttpsError("internal", "Search failed");
    }
});
// --- EMAIL SYSTEM ---
// Helper: Send Email via Resend
// Set via: RESEND_API_KEY / RESEND_FROM_EMAIL env vars or firebase functions:config:set resend.key="re_..." resend.from="Aboneyim <noreply@aboneyim.app>"
async function sendEmail(to, subject, html) {
    var _a, _b;
    const resendKey = process.env.RESEND_API_KEY || ((_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.key);
    const fromEmail = process.env.RESEND_FROM_EMAIL ||
        ((_b = functions.config().resend) === null || _b === void 0 ? void 0 : _b.from) ||
        "Aboneyim <onboarding@resend.dev>";
    if (!resendKey) {
        console.warn("Resend API key is not configured (RESEND_API_KEY or resend.key missing). Throwing failed-precondition so client can fall back to standard Firebase verification.");
        throw new functions.https.HttpsError("failed-precondition", "Email service (Resend) is not configured.");
    }
    const resend = new resend_1.Resend(resendKey);
    const { error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject,
        html,
    });
    if (error) {
        console.error("Resend Error:", error);
        throw new functions.https.HttpsError("internal", error.message || "Failed to send email provider request");
    }
}
// 2. Send Custom Verification Email
exports.sendCustomVerificationEmail = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const email = (data === null || data === void 0 ? void 0 : data.email) || context.auth.token.email;
    const redirectUrl = (data === null || data === void 0 ? void 0 : data.redirectUrl) ||
        process.env.APP_URL ||
        ((_a = functions.config().app) === null || _a === void 0 ? void 0 : _a.url) ||
        "https://subsense.app";
    if (!email || typeof email !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Email is required");
    }
    if (context.auth.token.email &&
        email.toLowerCase() !== context.auth.token.email.toLowerCase()) {
        throw new functions.https.HttpsError("permission-denied", "Cannot send verification email to a different address");
    }
    const resendKey = process.env.RESEND_API_KEY || ((_b = functions.config().resend) === null || _b === void 0 ? void 0 : _b.key);
    if (!resendKey) {
        console.warn("Resend API key is not configured (RESEND_API_KEY or resend.key missing). Falling back to client-side Firebase verification.");
        throw new functions.https.HttpsError("failed-precondition", "Email service (Resend) is not configured.");
    }
    try {
        // 1. Generate the link using Admin SDK
        const link = await admin.auth().generateEmailVerificationLink(email, {
            url: redirectUrl,
            handleCodeInApp: true,
        });
        // 2. Generate the HTML
        const html = (0, verificationTemplate_1.getVerificationEmailTemplate)(link, "Aboneyim");
        // 3. Send via Resend
        await sendEmail(email, "Verify your email for Aboneyim", html);
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Error sending custom verification email:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// 3. Revoke All Sessions (Sign out from all devices)
exports.revokeAllSessions = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    await admin.auth().revokeRefreshTokens(context.auth.uid);
    return { success: true };
});
// 4. Delete User Account (wipes Auth + Firestore)
exports.deleteUserAccount = functions.https.onCall(async (_data, context) => {
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
    }
    catch (error) {
        console.error("Account deletion failed:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// 5. API (Express App)
const app_1 = __importDefault(require("./app"));
exports.api = functions.https.onRequest(app_1.default);
// ── GEMINI PROXY FUNCTIONS ────────────────────────────────────────────────
// The Gemini API key is stored server-side in environment / Firebase Functions config.
// Set via: GEMINI_API_KEY env var or firebase functions:config:set gemini.key="AIza..."
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
async function callGeminiRaw(contents, systemInstruction, responseMimeType) {
    var _a, _b, _c, _d, _e, _f;
    const geminiKey = process.env.GEMINI_API_KEY || ((_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key);
    if (!geminiKey) {
        throw new functions.https.HttpsError("failed-precondition", "Gemini API key is not configured on the server. Set GEMINI_API_KEY or run: firebase functions:config:set gemini.key=\"AIza...\"");
    }
    const body = {
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
    return ((_f = (_e = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) || null;
}
// 6. Gemini Insights Proxy (single-turn, JSON response — open to all authenticated users)
exports.geminiProxy = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in to use AI features.");
    }
    const { prompt, systemInstruction } = data || {};
    if (!prompt || typeof prompt !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "prompt is required.");
    }
    if (prompt.length > 20000) {
        throw new functions.https.HttpsError("invalid-argument", "prompt exceeds maximum allowed length (20000 characters).");
    }
    if (systemInstruction !== undefined &&
        (typeof systemInstruction !== "string" || systemInstruction.length > 20000)) {
        throw new functions.https.HttpsError("invalid-argument", "systemInstruction exceeds maximum allowed length.");
    }
    const text = await callGeminiRaw([{ parts: [{ text: prompt }] }], systemInstruction, "application/json");
    return { text };
});
// 7. Gemini Chat Proxy (multi-turn conversation — open to all authenticated users)
exports.geminiChatProxy = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in to use AI features.");
    }
    const { history, userMessage, systemInstruction } = data || {};
    if (!userMessage || typeof userMessage !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "userMessage is required.");
    }
    if (userMessage.length > 8000) {
        throw new functions.https.HttpsError("invalid-argument", "userMessage exceeds maximum allowed length (8000 characters).");
    }
    if (history !== undefined && (!Array.isArray(history) || history.length > 40)) {
        throw new functions.https.HttpsError("invalid-argument", "history must be an array with at most 40 entries.");
    }
    if (systemInstruction !== undefined &&
        (typeof systemInstruction !== "string" || systemInstruction.length > 20000)) {
        throw new functions.https.HttpsError("invalid-argument", "systemInstruction exceeds maximum allowed length.");
    }
    const contents = [
        ...(Array.isArray(history) ? history : []),
        { role: "user", parts: [{ text: userMessage }] },
    ];
    const text = await callGeminiRaw(contents, systemInstruction);
    return { text };
});
__exportStar(require("./calendar"), exports);
__exportStar(require("./emails"), exports);
__exportStar(require("./priceSync"), exports);
__exportStar(require("./friends"), exports);
__exportStar(require("./referrals"), exports);
//# sourceMappingURL=index.js.map