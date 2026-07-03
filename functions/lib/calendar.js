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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCalendarFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const ical_generator_1 = __importDefault(require("ical-generator"));
// Helper to get db if not initialized
const getDb = () => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
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
        // Find user by calendarToken
        const usersSnapshot = await db.collection("users").where("calendarToken", "==", token).limit(1).get();
        if (usersSnapshot.empty) {
            res.status(404).send("Invalid token or user not found");
            return;
        }
        const userId = usersSnapshot.docs[0].id;
        // Fetch user's active subscriptions
        const subsSnapshot = await db.collection(`users/${userId}/subscriptions`).where("status", "==", "Active").get();
        const cal = (0, ical_generator_1.default)({
            name: "SubSense Calendar",
            description: "Upcoming subscription renewals tracked via SubSense",
        });
        subsSnapshot.docs.forEach(doc => {
            const sub = doc.data();
            if (!sub.nextDate)
                return;
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
    }
    catch (error) {
        console.error("Calendar feed error:", error);
        res.status(500).send("Internal server error");
    }
});
//# sourceMappingURL=calendar.js.map