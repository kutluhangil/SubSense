import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import ical from "ical-generator";

// Helper to get db if not initialized
const getDb = () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
};

export const generateCalendarFeed = functions.https.onRequest(async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).send("Missing token parameter");
    return;
  }

  const db = getDb();
  
  try {
    // Find user by calendarToken
    const usersSnapshot = await db.collection("users").where("calendarToken", "==", token).limit(1).get();
    
    if (usersSnapshot.empty) {
      res.status(404).send("Invalid token or user not found");
      return;
    }

    const userId = usersSnapshot.docs[0].id;
    
    // Fetch user's active subscriptions
    const subsSnapshot = await db.collection(`users/${userId}/subscriptions`).where("status", "==", "Active").get();
    
    const cal = ical({
      name: "SubSense Calendar",
      description: "Upcoming subscription renewals tracked via SubSense",
    });

    subsSnapshot.docs.forEach(doc => {
      const sub = doc.data();
      if (!sub.nextDate) return;

      const dateObj = new Date(sub.nextDate);
      
      cal.createEvent({
        start: dateObj,
        allDay: true,
        summary: `Renewal: ${sub.name}`,
        description: `Your ${sub.name} subscription will renew today for ${sub.price} ${sub.currency}.`,
      });
    });

    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="subsense-calendar.ics"');
    res.status(200).send(cal.toString());
  } catch (error) {
    console.error("Calendar feed error:", error);
    res.status(500).send("Internal server error");
  }
});
