import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
  if (!admin.apps.length) admin.initializeApp();
  return admin.firestore();
};

const requireAuth = (context: functions.https.CallableContext): string => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required.");
  }
  return context.auth.uid;
};

// Send a friend request to another user (by uid).
export const sendFriendRequestFn = functions.https.onCall(async (data, context) => {
  const fromUid = requireAuth(context);
  const toUid = (data?.toUid || "").toString();

  if (!toUid) throw new functions.https.HttpsError("invalid-argument", "toUid required.");
  if (toUid === fromUid) throw new functions.https.HttpsError("invalid-argument", "Cannot add yourself.");

  const db = getDb();
  const [me, target] = await Promise.all([
    db.collection("users").doc(fromUid).get(),
    db.collection("users").doc(toUid).get(),
  ]);
  if (!target.exists) throw new functions.https.HttpsError("not-found", "User not found.");

  // Already friends?
  const existing = await db.collection("users").doc(fromUid).collection("friends").doc(toUid).get();
  if (existing.exists) return { status: "already_friends" };

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
export const respondFriendRequestFn = functions.https.onCall(async (data, context) => {
  const myUid = requireAuth(context);
  const senderUid = (data?.senderUid || "").toString();
  const accept = data?.accept === true;
  if (!senderUid) throw new functions.https.HttpsError("invalid-argument", "senderUid required.");

  const db = getDb();
  const reqRef = db.collection("users").doc(myUid).collection("friendRequests").doc(senderUid);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new functions.https.HttpsError("not-found", "Request not found.");

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
export const listFriendRequestsFn = functions.https.onCall(async (_data, context) => {
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
export const listFriendsFn = functions.https.onCall(async (_data, context) => {
  const myUid = requireAuth(context);
  const db = getDb();

  const friendsSnap = await db.collection("users").doc(myUid).collection("friends").get();
  const friendIds = friendsSnap.docs.map((d) => d.id);
  if (friendIds.length === 0) return { friends: [] };

  const docs = await db.getAll(...friendIds.map((id) => db.collection("users").doc(id)));

  const friends = docs
    .filter((d) => d.exists)
    .map((d) => {
      const v = d.data() || {};
      const prefs = v.preferences || {};
      const privacy = prefs.privacy || { showSpending: true, showSubscriptions: true };
      const stats = v.stats || {};
      const out: Record<string, unknown> = {
        uid: d.id,
        displayName: v.displayName || null,
        email: v.email || null,
        region: prefs.region || null,
        baseCurrency: prefs.baseCurrency || "USD",
      };
      if (privacy.showSubscriptions !== false) out.totalSubscriptions = stats.totalSubscriptions ?? 0;
      if (privacy.showSpending !== false) out.monthlySpend = stats.monthlySpend ?? 0;
      return out;
    });

  return { friends };
});
