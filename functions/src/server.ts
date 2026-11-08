import express from "express";
import cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { initFirebaseAdmin, isServiceAccountConfigured } from "./initAdmin";

// Initialize Firebase Admin before loading function modules
initFirebaseAdmin();

import * as fnExports from "./index";

const server = express();
server.use(cors({ origin: true }));
server.use(express.json({ limit: "2mb" }));

// Map of callable functions exposed at POST /api/fn/:name
const CALLABLE_FUNCTIONS: Record<string, any> = {
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
const healthHandler: express.RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "aboneyim_api",
    adminConfigured: isServiceAccountConfigured(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    callableEndpoints: Object.keys(CALLABLE_FUNCTIONS),
  });
};

server.get("/health", healthHandler);
server.get("/api/health", healthHandler);

// Calendar ICS feed (GET /api/calendar.ics?token=... or /generateCalendarFeed?token=...)
server.get("/api/calendar.ics", (req, res) => {
  fnExports.generateCalendarFeed(req as any, res as any);
});
server.get("/api/generateCalendarFeed", (req, res) => {
  fnExports.generateCalendarFeed(req as any, res as any);
});
server.get("/generateCalendarFeed", (req, res) => {
  fnExports.generateCalendarFeed(req as any, res as any);
});

// Express REST sub-app (/api/subscriptions)
server.use(fnExports.api);

// Generic Callable Function dispatcher (POST /api/fn/:name)
const callableHandler: express.RequestHandler = async (req, res) => {
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
  let authContext: { uid: string; token: admin.auth.DecodedIdToken } | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.slice("Bearer ".length).trim();
    if (idToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        authContext = { uid: decoded.uid, token: decoded };
      } catch (err: any) {
        res.status(401).json({
          error: {
            status: "unauthenticated",
            message: err?.message || "Invalid or expired authentication token.",
          },
        });
        return;
      }
    }
  }

  const payload =
    req.body && typeof req.body === "object" && "data" in req.body
      ? req.body.data
      : req.body ?? {};

  try {
    const result = await target.run(payload, {
      auth: authContext,
      rawRequest: req,
    });
    res.status(200).json({ result });
  } catch (err: any) {
    if (err instanceof functions.https.HttpsError) {
      const statusMap: Record<string, number> = {
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
          details: err.details ?? null,
        },
      });
      return;
    }

    console.error(`[aboneyim_api] Error in ${fnName}:`, err);
    res.status(500).json({
      error: {
        status: "internal",
        message: err?.message || "Internal server error",
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

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const key = `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
  if (key === lastTriggeredMinute) return;
  lastTriggeredMinute = key;

  const hour = getPart("hour");
  const minute = getPart("minute");
  const day = getPart("day");
  const weekday = getPart("weekday");

  // Weekly Monday at 03:00 Europe/Istanbul -> syncPricesWeekly (Gemini Google Search grounding + ECB FX)
  if (weekday === "Mon" && hour === "03" && minute === "00") {
    console.log("[aboneyim_api] Running scheduled syncPricesWeekly...");
    fnExports.syncPricesWeekly.run({}, {}).catch((e: any) =>
      console.error("syncPricesWeekly cron error:", e)
    );
  }

  if (!isServiceAccountConfigured()) return;

  // Daily 09:00 Europe/Istanbul -> sendRenewalReminders
  if (hour === "09" && minute === "00") {
    console.log("[aboneyim_api] Running scheduled sendRenewalReminders...");
    fnExports.sendRenewalReminders.run({}, {}).catch((e: any) =>
      console.error("sendRenewalReminders cron error:", e)
    );
  }

  // Monthly Day 1 at 09:00 Europe/Istanbul -> sendMonthlyReports
  if (day === "01" && hour === "09" && minute === "00") {
    console.log("[aboneyim_api] Running scheduled sendMonthlyReports...");
    fnExports.sendMonthlyReports.run({}, {}).catch((e: any) =>
      console.error("sendMonthlyReports cron error:", e)
    );
  }
}, 30_000);

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `✓ aboneyim_api listening on internal port ${PORT} (serviceAccount=${isServiceAccountConfigured()}, gemini=${Boolean(
      process.env.GEMINI_API_KEY
    )})`
  );
});

