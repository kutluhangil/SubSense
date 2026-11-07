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
exports.generateCalendarFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const ical_generator_1 = __importStar(require("ical-generator"));
const initAdmin_1 = require("./initAdmin");
// Helper to get db if not initialized
const getDb = () => {
    (0, initAdmin_1.initFirebaseAdmin)();
    return admin.firestore();
};
exports.generateCalendarFeed = functions.https.onRequest(async (req, res) => {
    const token = req.query.token;
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
        const cal = (0, ical_generator_1.default)({
            name: "Aboneyim Calendar",
            description: "Upcoming subscription renewals and trial endings tracked via Aboneyim",
        });
        subsSnapshot.docs.forEach((doc) => {
            const sub = doc.data();
            const effectivePrice = sub.isShared && sub.myShare ? sub.myShare : sub.price;
            if (sub.status === "Trial") {
                const rawTrialDate = sub.trialEndDate || sub.nextDate;
                if (!rawTrialDate)
                    return;
                const trialDateObj = new Date(rawTrialDate);
                if (isNaN(trialDateObj.getTime()))
                    return;
                cal.createEvent({
                    start: trialDateObj,
                    allDay: true,
                    summary: `Trial Ends: ${sub.name}`,
                    description: `Your ${sub.name} trial ends today (${effectivePrice} ${sub.currency}).`,
                });
                return;
            }
            if (!sub.nextDate)
                return;
            const dateObj = new Date(sub.nextDate);
            if (isNaN(dateObj.getTime()))
                return;
            cal.createEvent({
                start: dateObj,
                allDay: true,
                repeating: {
                    freq: sub.cycle === "Yearly"
                        ? ical_generator_1.ICalEventRepeatingFreq.YEARLY
                        : ical_generator_1.ICalEventRepeatingFreq.MONTHLY,
                },
                summary: `Renewal: ${sub.name}`,
                description: `Your ${sub.name} subscription will renew today for ${effectivePrice} ${sub.currency}.`,
            });
        });
        res.set("Content-Type", "text/calendar; charset=utf-8");
        res.set("Content-Disposition", 'attachment; filename="aboneyim-calendar.ics"');
        res.status(200).send(cal.toString());
    }
    catch (error) {
        console.error("Calendar feed error:", error);
        res.status(500).send("Internal server error");
    }
});
//# sourceMappingURL=calendar.js.map