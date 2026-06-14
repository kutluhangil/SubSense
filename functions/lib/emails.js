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
exports.sendRenewalReminders = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
const getDb = () => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
};
// Resend API key is read from Functions config — never hardcoded in source.
// Set via: firebase functions:config:set resend.key="re_..."
const getResend = () => {
    var _a;
    const key = (_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.key;
    if (!key) {
        console.error("resend.key is not configured — skipping email send.");
        return null;
    }
    return new resend_1.Resend(key);
};
exports.sendRenewalReminders = functions.pubsub.schedule("every day 09:00").timeZone("Europe/Istanbul").onRun(async (context) => {
    const db = getDb();
    const resend = getResend();
    if (!resend)
        return null;
    // Calculate target date (3 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    // Formatting logic depends on how dates are stored in Firestore.
    // In this app, nextDate is often stored as "MMM DD, YYYY" or similar depending on the locale.
    // For simplicity, we'll fetch all users and their active subs, and filter manually to avoid complex date queries in Firestore.
    try {
        const usersSnap = await db.collection("users").get();
        for (const userDoc of usersSnap.docs) {
            const userData = userDoc.data();
            const email = userData.email;
            if (!email)
                continue;
            const subsSnap = await db.collection(`users/${userDoc.id}/subscriptions`).where("status", "==", "Active").get();
            for (const subDoc of subsSnap.docs) {
                const sub = subDoc.data();
                if (!sub.nextDate || sub.reminderEnabled === false)
                    continue;
                const subDate = new Date(sub.nextDate);
                const timeDiff = subDate.getTime() - new Date().getTime();
                const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (daysUntil === 3) {
                    // Send reminder 3 days before
                    await resend.emails.send({
                        from: "SubSense <noreply@subsense.app>",
                        to: [email],
                        subject: `Yaklaşan Ödeme: ${sub.name} (3 Gün Kaldı)`,
                        html: `
              <h2>Abonelik Yenileme Hatırlatıcısı</h2>
              <p>Merhaba,</p>
              <p><strong>${sub.name}</strong> aboneliğiniz 3 gün sonra yenilenecek.</p>
              <p>Tutar: <strong>${sub.price} ${sub.currency}</strong></p>
              <p>Eğer kullanmıyorsanız iptal etmeyi unutmayın!</p>
              <br/>
              <p>SubSense Ekibi</p>
            `
                    });
                }
            }
        }
    }
    catch (error) {
        console.error("Error sending reminders:", error);
    }
    return null;
});
//# sourceMappingURL=emails.js.map