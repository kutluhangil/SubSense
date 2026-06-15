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
exports.listFriendsFn = exports.listFriendRequestsFn = exports.respondFriendRequestFn = exports.sendFriendRequestFn = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Friend system — all cross-user reads/writes go through these callable
 * functions (Admin SDK), so Firestore security rules stay fully locked and
 * privacy is enforced server-side. Clients never read another user's doc.
 *
 * Data model:
 *   users/{uid}/friendRequests/{fromUid}  -> incoming request + sender preview
 *   users/{uid}/friends/{friendUid}       -> accepted friendship (mirrored)
 *
 * Privacy: each user doc may carry `privacy: { showSpending, showSubscriptions }`
 * (default true). listFriends only returns fields the friend allows.
 */
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
// Send a friend request to another user (by uid).
exports.sendFriendRequestFn = functions.https.onCall(async (data, context) => {
    const fromUid = requireAuth(context);
    const toUid = ((data === null || data === void 0 ? void 0 : data.toUid) || "").toString();
    if (!toUid)
        throw new functions.https.HttpsError("invalid-argument", "toUid required.");
    if (toUid === fromUid)
        throw new functions.https.HttpsError("invalid-argument", "Cannot add yourself.");
    const db = getDb();
    const [me, target] = await Promise.all([
        db.collection("users").doc(fromUid).get(),
        db.collection("users").doc(toUid).get(),
    ]);
    if (!target.exists)
        throw new functions.https.HttpsError("not-found", "User not found.");
    // Already friends?
    const existing = await db.collection("users").doc(fromUid).collection("friends").doc(toUid).get();
    if (existing.exists)
        return { status: "already_friends" };
    const meData = me.data() || {};
    await db.collection("users").doc(toUid).collection("friendRequests").doc(fromUid).set({
        fromUid,
        displayName: meData.displayName || null,
        email: meData.email || null,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: "sent" };
});
// Accept or reject an incoming request.
exports.respondFriendRequestFn = functions.https.onCall(async (data, context) => {
    const myUid = requireAuth(context);
    const senderUid = ((data === null || data === void 0 ? void 0 : data.senderUid) || "").toString();
    const accept = (data === null || data === void 0 ? void 0 : data.accept) === true;
    if (!senderUid)
        throw new functions.https.HttpsError("invalid-argument", "senderUid required.");
    const db = getDb();
    const reqRef = db.collection("users").doc(myUid).collection("friendRequests").doc(senderUid);
    const reqSnap = await reqRef.get();
    if (!reqSnap.exists)
        throw new functions.https.HttpsError("not-found", "Request not found.");
    if (accept) {
        const ts = admin.firestore.FieldValue.serverTimestamp();
        const batch = db.batch();
        batch.set(db.collection("users").doc(myUid).collection("friends").doc(senderUid), { since: ts });
        batch.set(db.collection("users").doc(senderUid).collection("friends").doc(myUid), { since: ts });
        batch.delete(reqRef);
        await batch.commit();
        return { status: "accepted" };
    }
    await reqRef.delete();
    return { status: "rejected" };
});
// List incoming friend requests (sender previews).
exports.listFriendRequestsFn = functions.https.onCall(async (_data, context) => {
    const myUid = requireAuth(context);
    const db = getDb();
    const snap = await db.collection("users").doc(myUid).collection("friendRequests").get();
    const requests = snap.docs.map((d) => {
        const v = d.data();
        return { uid: d.id, displayName: v.displayName || null, email: v.email || null };
    });
    return { requests };
});
// List accepted friends with privacy-filtered profiles.
exports.listFriendsFn = functions.https.onCall(async (_data, context) => {
    const myUid = requireAuth(context);
    const db = getDb();
    const friendsSnap = await db.collection("users").doc(myUid).collection("friends").get();
    const friendIds = friendsSnap.docs.map((d) => d.id);
    if (friendIds.length === 0)
        return { friends: [] };
    const docs = await db.getAll(...friendIds.map((id) => db.collection("users").doc(id)));
    const friends = docs
        .filter((d) => d.exists)
        .map((d) => {
        var _a, _b;
        const v = d.data() || {};
        const prefs = v.preferences || {};
        const privacy = prefs.privacy || { showSpending: true, showSubscriptions: true };
        const stats = v.stats || {};
        const out = {
            uid: d.id,
            displayName: v.displayName || null,
            email: v.email || null,
            region: prefs.region || null,
            baseCurrency: prefs.baseCurrency || "USD",
        };
        if (privacy.showSubscriptions !== false)
            out.totalSubscriptions = (_a = stats.totalSubscriptions) !== null && _a !== void 0 ? _a : 0;
        if (privacy.showSpending !== false)
            out.monthlySpend = (_b = stats.monthlySpend) !== null && _b !== void 0 ? _b : 0;
        return out;
    });
    return { friends };
});
//# sourceMappingURL=friends.js.map