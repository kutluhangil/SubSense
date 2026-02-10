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
exports.authenticate = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
// Note: Firebase Admin is initialized in index.ts (the entry point)
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
// Auth Middleware
const authenticate = async (req, res, next) => {
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
        req.user = decodedToken;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "Invalid or expired authorization token",
            },
        });
    }
};
exports.authenticate = authenticate;
// Mount Routes — both paths needed:
// /api/subscriptions → Firebase Hosting rewrites forward the full path
// /subscriptions    → Direct Cloud Function calls strip the function name
app.use("/api/subscriptions", exports.authenticate, subscriptions_1.default);
app.use("/subscriptions", exports.authenticate, subscriptions_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_SERVER_ERROR",
            message: err.message || "An unexpected error occurred",
        },
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map