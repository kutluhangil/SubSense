import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import ical, { ICalEventRepeatingFreq } from "ical-generator";
import { initFirebaseAdmin } from "./initAdmin";

// Helper to get db if not initialized
const getDb = () => {
  initFirebaseAdmin();
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
    // Find user by calendarToken (check preferences.calendarToken first, then fallback to root calendarToken)
    let usersSnapshot = await db
      .collection("users")
      .where("preferences.calendarToken", "==", token)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      usersSnapshot = await db
        .collection("users")
        .where("calendarToken", "==", token)
        .limit(1)
        .get();
    }

    if (usersSnapshot.empty) {
      res.status(404).send("Invalid token or user not found");
      return;
    }

    const userId = usersSnapshot.docs[0].id;

    // Fetch user's active and trial subscriptions
    const subsSnapshot = await db
      .collection(`users/${userId}/subscriptions`)
      .where("status", "in", ["Active", "Trial"])
      .get();

    const cal = ical({
      name: "Aboneyim Calendar",
      description: "Upcoming subscription renewals and trial endings tracked via Aboneyim",
    });

    subsSnapshot.docs.forEach((doc) => {
      const sub = doc.data();
      const effectivePrice = sub.isShared && sub.myShare ? sub.myShare : sub.price;

      if (sub.status === "Trial") {
        const rawTrialDate = sub.trialEndDate || sub.nextDate;
        if (!rawTrialDate) return;

        const trialDateObj = new Date(rawTrialDate);
        if (isNaN(trialDateObj.getTime())) return;

        cal.createEvent({
          start: trialDateObj,
          allDay: true,
          summary: `Trial Ends: ${sub.name}`,
          description: `Your ${sub.name} trial ends today (${effectivePrice} ${sub.currency}).`,
        });
        return;
      }

      if (!sub.nextDate) return;

      const dateObj = new Date(sub.nextDate);
      if (isNaN(dateObj.getTime())) return;

      cal.createEvent({
        start: dateObj,
        allDay: true,
        repeating: {
          freq:
            sub.cycle === "Yearly"
              ? ICalEventRepeatingFreq.YEARLY
              : ICalEventRepeatingFreq.MONTHLY,
        },
        summary: `Renewal: ${sub.name}`,
        description: `Your ${sub.name} subscription will renew today for ${effectivePrice} ${sub.currency}.`,
      });
    });

    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="aboneyim-calendar.ics"');
    res.status(200).send(cal.toString());
  } catch (error) {
    console.error("Calendar feed error:", error);
    res.status(500).send("Internal server error");
  }
});
