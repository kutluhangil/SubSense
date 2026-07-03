
import express from "express";
import cors from "cors";
import * as admin from "firebase-admin";
// Note: Firebase Admin is initialized in index.ts (the entry point)

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

import subscriptionRouter from "./routes/subscriptions";

// Auth Middleware
export const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Missing or invalid authorization token",
            },
        });
        return;
    }

    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        (req as any).user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "Invalid or expired authorization token",
            },
        });
    }
};

// Mount Routes — both paths needed:
// /api/subscriptions → Firebase Hosting rewrites forward the full path
// /subscriptions    → Direct Cloud Function calls strip the function name
app.use("/api/subscriptions", authenticate, subscriptionRouter);
app.use("/subscriptions", authenticate, subscriptionRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_SERVER_ERROR",
            message: err.message || "An unexpected error occurred",
        },
    });
});

export default app;
