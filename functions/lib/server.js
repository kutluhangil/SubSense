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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const initAdmin_1 = require("./initAdmin");
// Initialize Firebase Admin before loading function modules
(0, initAdmin_1.initFirebaseAdmin)();
const fnExports = __importStar(require("./index"));
const server = (0, express_1.default)();
server.use((0, cors_1.default)({ origin: true }));
server.use(express_1.default.json({ limit: "2mb" }));
// Map of callable functions exposed at POST /api/fn/:name
const CALLABLE_FUNCTIONS = {
    searchUsers: fnExports.searchUsers,
    sendCustomVerificationEmail: fnExports.sendCustomVerificationEmail,
    revokeAllSessions: fnExports.revokeAllSessions,
    deleteUserAccount: fnExports.deleteUserAccount,
    geminiProxy: fnExports.geminiProxy,
    geminiChatProxy: fnExports.geminiChatProxy,
    triggerPriceSync: fnExports.triggerPriceSync,
    sendFriendRequestFn: fnExports.sendFriendRequestFn,
    respondFriendRequestFn: fnExports.respondFriendRequestFn,
    listFriendRequestsFn: fnExports.listFriendRequestsFn,
    listFriendsFn: fnExports.listFriendsFn,
    removeFriendFn: fnExports.removeFriendFn,
    getReferralCode: fnExports.getReferralCode,
    redeemReferral: fnExports.redeemReferral,
};
// Healthcheck endpoint
const healthHandler = (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "aboneyim_api",
        adminConfigured: (0, initAdmin_1.isServiceAccountConfigured)(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
        callableEndpoints: Object.keys(CALLABLE_FUNCTIONS),
    });
};
server.get("/health", healthHandler);
server.get("/api/health", healthHandler);
// Calendar ICS feed (GET /api/calendar.ics?token=... or /generateCalendarFeed?token=...)
server.get("/api/calendar.ics", (req, res) => {
    fnExports.generateCalendarFeed(req, res);
});
server.get("/api/generateCalendarFeed", (req, res) => {
    fnExports.generateCalendarFeed(req, res);
});
server.get("/generateCalendarFeed", (req, res) => {
    fnExports.generateCalendarFeed(req, res);
});
// Express REST sub-app (/api/subscriptions)
server.use(fnExports.api);
// Generic Callable Function dispatcher (POST /api/fn/:name)
const callableHandler = async (req, res) => {
    var _a, _b;
    const fnName = req.params.name;
    const target = CALLABLE_FUNCTIONS[fnName];
    if (!target || typeof target.run !== "function") {
        res.status(404).json({
            error: {
                status: "not-found",
                message: `Callable function '${fnName}' not found.`,
            },
        });
        return;
    }
    // Verify Bearer token if provided
    let authContext;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.slice("Bearer ".length).trim();
        if (idToken) {
            try {
                const decoded = await admin.auth().verifyIdToken(idToken);
                authContext = { uid: decoded.uid, token: decoded };
            }
            catch (err) {
                res.status(401).json({
                    error: {
                        status: "unauthenticated",
                        message: (err === null || err === void 0 ? void 0 : err.message) || "Invalid or expired authentication token.",
                    },
                });
                return;
            }
        }
    }
    const payload = req.body && typeof req.body === "object" && "data" in req.body
        ? req.body.data
        : (_a = req.body) !== null && _a !== void 0 ? _a : {};
    try {
        const result = await target.run(payload, {
            auth: authContext,
            rawRequest: req,
        });
        res.status(200).json({ result });
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError) {
            const statusMap = {
                unauthenticated: 401,
                "permission-denied": 403,
                "invalid-argument": 400,
                "not-found": 404,
                "failed-precondition": 412,
                "already-exists": 409,
                "resource-exhausted": 429,
            };
            const httpStatus = statusMap[err.code] || 500;
            res.status(httpStatus).json({
                error: {
                    status: err.code,
                    message: err.message,
                    details: (_b = err.details) !== null && _b !== void 0 ? _b : null,
                },
            });
            return;
        }
        console.error(`[aboneyim_api] Error in ${fnName}:`, err);
        res.status(500).json({
            error: {
                status: "internal",
                message: (err === null || err === void 0 ? void 0 : err.message) || "Internal server error",
            },
        });
    }
};
server.post("/api/fn/:name", callableHandler);
server.post("/fn/:name", callableHandler);
// Lightweight cron scheduler for Europe/Istanbul scheduled jobs
let lastTriggeredMinute = "";
setInterval(() => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(now);
    const getPart = (type) => { var _a; return ((_a = parts.find((p) => p.type === type)) === null || _a === void 0 ? void 0 : _a.value) || ""; };
    const key = `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
    if (key === lastTriggeredMinute)
        return;
    lastTriggeredMinute = key;
    const hour = getPart("hour");
    const minute = getPart("minute");
    const day = getPart("day");
    const weekday = getPart("weekday");
    // Weekly Monday at 03:00 Europe/Istanbul -> syncPricesWeekly (Gemini Google Search grounding + ECB FX)
    if (weekday === "Mon" && hour === "03" && minute === "00") {
        console.log("[aboneyim_api] Running scheduled syncPricesWeekly...");
        fnExports.syncPricesWeekly.run({}, {}).catch((e) => console.error("syncPricesWeekly cron error:", e));
    }
    if (!(0, initAdmin_1.isServiceAccountConfigured)())
        return;
    // Daily 09:00 Europe/Istanbul -> sendRenewalReminders
    if (hour === "09" && minute === "00") {
        console.log("[aboneyim_api] Running scheduled sendRenewalReminders...");
        fnExports.sendRenewalReminders.run({}, {}).catch((e) => console.error("sendRenewalReminders cron error:", e));
    }
    // Monthly Day 1 at 09:00 Europe/Istanbul -> sendMonthlyReports
    if (day === "01" && hour === "09" && minute === "00") {
        console.log("[aboneyim_api] Running scheduled sendMonthlyReports...");
        fnExports.sendMonthlyReports.run({}, {}).catch((e) => console.error("sendMonthlyReports cron error:", e));
    }
}, 30000);
const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ aboneyim_api listening on internal port ${PORT} (serviceAccount=${(0, initAdmin_1.isServiceAccountConfigured)()}, gemini=${Boolean(process.env.GEMINI_API_KEY)})`);
});
//# sourceMappingURL=server.js.map