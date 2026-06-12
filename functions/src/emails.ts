import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

const getDb = () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
};

const RESEND_API_KEY = "re_fQDAZQKM_C82KeeLQDfxFoTrWpcnXVHPU";
const resend = new Resend(RESEND_API_KEY);

export const sendRenewalReminders = functions.pubsub.schedule("every day 09:00").timeZone("Europe/Istanbul").onRun(async (context) => {
  const db = getDb();
  
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
      if (!email) continue;
      
      const subsSnap = await db.collection(`users/${userDoc.id}/subscriptions`).where("status", "==", "Active").get();
      
      for (const subDoc of subsSnap.docs) {
        const sub = subDoc.data();
        if (!sub.nextDate || sub.reminderEnabled === false) continue;
        
        const subDate = new Date(sub.nextDate);
        const timeDiff = subDate.getTime() - new Date().getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysUntil === 3) {
          // Send reminder 3 days before
          await resend.emails.send({
            from: "SubSense <noreply@subsense.app>", // Assumes domain is verified, otherwise Resend will use a default
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
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});
