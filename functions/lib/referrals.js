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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemReferral = exports.getReferralCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Referral program — a viral growth loop. Each user gets a shareable invite
 * code. When a NEW user signs up via that link and redeems it, BOTH the
 * referrer and the new user are granted 30 days of Pro.
 *
 * All cross-user reads/writes go through these callable functions (Admin SDK),
 * so Firestore security rules stay fully locked — no rules change needed.
 *
 * Data model (on the user doc):
 *   users/{uid}.referral.code           -> short stable invite code
 *   users/{uid}.referral.redeemedFrom   -> referrerUid (set once, on the new user)
 *   users/{uid}.referral.referredCount  -> how many people this user invited
 *   users/{uid}.plan.proUntil           -> epoch millis; Pro is active while in the future
 */
const REWARD_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const getDb = () => {
    if (!admin.apps.length)
        admin.initializeApp();
    return admin.firestore();
};
const requireAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }
    return context.auth.uid;
};
// Generate a short, URL-safe, human-friendly referral code (no ambiguous chars).
const generateCode = () => {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 7; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
};
// Find a user by their referral code. Returns the doc snapshot or null.
const findUserByCode = async (db, code) => {
    const snap = await db
        .collection("users")
        .where("referral.code", "==", code)
        .limit(1)
        .get();
    if (snap.empty)
        return null;
    return snap.docs[0];
};
// Compute the extended proUntil: max(now, existing) + REWARD_DAYS.
const extendProUntil = (existing) => {
    const now = Date.now();
    let base = now;
    if (typeof existing === "number" && existing > now) {
        base = existing;
    }
    else if (existing && typeof existing.toMillis === "function") {
        const ms = existing.toMillis();
        if (ms > now)
            base = ms;
    }
    return base + REWARD_DAYS * DAY_MS;
};
/**
 * Return the caller's referral code + stats, creating a code on first call.
 * Idempotent: a code is generated once and reused thereafter.
 */
exports.getReferralCode = functions.https.onCall(async (_data, context) => {
    var _a, _b;
    const uid = requireAuth(context);
    const db = getDb();
    try {
        const userRef = db.collection("users").doc(uid);
        const snap = await userRef.get();
        const data = snap.data() || {};
        const referral = data.referral || {};
        let code = referral.code || "";
        if (!code) {
            // Generate a unique code (retry on the rare collision).
            for (let attempt = 0; attempt < 5; attempt++) {
                const candidate = generateCode();
                const existing = await findUserByCode(db, candidate);
                if (!existing) {
                    code = candidate;
                    break;
                }
            }
            if (!code)
                code = generateCode(); // last-resort fallback
            await userRef.set({ referral: { code } }, { merge: true });
        }
        const proUntil = (_b = (_a = data.plan) === null || _a === void 0 ? void 0 : _a.proUntil) !== null && _b !== void 0 ? _b : null;
        const proUntilMs = typeof proUntil === "number"
            ? proUntil
            : proUntil && typeof proUntil.toMillis === "function"
                ? proUntil.toMillis()
                : null;
        return {
            status: "ok",
            code,
            referredCount: referral.referredCount || 0,
            proDaysEarned: (referral.referredCount || 0) * REWARD_DAYS,
            proUntil: proUntilMs,
        };
    }
    catch (error) {
        console.error("getReferralCode failed:", error);
        return { status: "error", code: "", referredCount: 0, proDaysEarned: 0, proUntil: null };
    }
});
/**
 * Redeem a referral code for a NEW user (called once, right after signup).
 * Guards: self-referral, already-redeemed, unknown code. On success grants
 * BOTH users 30 days of Pro and increments the referrer's referredCount.
 */
exports.redeemReferral = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const newUid = requireAuth(context);
    const code = ((data === null || data === void 0 ? void 0 : data.code) || "").toString().trim().toUpperCase();
    if (!code)
        return { status: "invalid_code" };
    const db = getDb();
    try {
        const newUserRef = db.collection("users").doc(newUid);
        const newUserSnap = await newUserRef.get();
        const newUserData = newUserSnap.data() || {};
        const newReferral = newUserData.referral || {};
        // Already redeemed — never double-grant.
        if (newReferral.redeemedFrom) {
            return { status: "already_redeemed" };
        }
        // Self-referral guard (their own code).
        if (newReferral.code === code) {
            return { status: "self_referral" };
        }
        const referrerDoc = await findUserByCode(db, code);
        if (!referrerDoc) {
            return { status: "unknown_code" };
        }
        const referrerUid = referrerDoc.id;
        if (referrerUid === newUid) {
            return { status: "self_referral" };
        }
        const referrerData = referrerDoc.data() || {};
        // Grant both users 30 days of Pro by extending plan.proUntil.
        const newUserProUntil = extendProUntil((_a = newUserData.plan) === null || _a === void 0 ? void 0 : _a.proUntil);
        const referrerProUntil = extendProUntil((_b = referrerData.plan) === null || _b === void 0 ? void 0 : _b.proUntil);
        const batch = db.batch();
        batch.set(newUserRef, {
            referral: { redeemedFrom: referrerUid },
            plan: { proUntil: newUserProUntil },
        }, { merge: true });
        batch.set(db.collection("users").doc(referrerUid), {
            referral: { referredCount: admin.firestore.FieldValue.increment(1) },
            plan: { proUntil: referrerProUntil },
        }, { merge: true });
        await batch.commit();
        return { status: "success", proDaysGranted: REWARD_DAYS };
    }
    catch (error) {
        console.error("redeemReferral failed:", error);
        return { status: "error" };
    }
});
//# sourceMappingURL=referrals.js.map