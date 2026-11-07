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
exports.isServiceAccountConfigured = exports.initFirebaseAdmin = void 0;
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let hasFullServiceAccount = false;
function initFirebaseAdmin() {
    var _a;
    if (admin.apps.length > 0 && admin.apps[0]) {
        return admin.apps[0];
    }
    const projectId = process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        "subscriptionhub-85b02";
    // 1. Check inline JSON or Base64 env var: FIREBASE_SERVICE_ACCOUNT_JSON
    const rawJsonEnv = (_a = process.env.FIREBASE_SERVICE_ACCOUNT_JSON) === null || _a === void 0 ? void 0 : _a.trim();
    if (rawJsonEnv) {
        try {
            const jsonStr = rawJsonEnv.startsWith("{")
                ? rawJsonEnv
                : Buffer.from(rawJsonEnv, "base64").toString("utf8");
            const parsed = JSON.parse(jsonStr);
            hasFullServiceAccount = true;
            return admin.initializeApp({
                credential: admin.credential.cert(parsed),
                projectId: parsed.project_id || projectId,
            });
        }
        catch (err) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
        }
    }
    // 2. Check serviceAccountKey.json file path
    const candidatePaths = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        path.resolve(process.cwd(), "serviceAccountKey.json"),
        path.resolve(process.cwd(), "../serviceAccountKey.json"),
        "/app/serviceAccountKey.json",
    ].filter(Boolean);
    for (const filePath of candidatePaths) {
        try {
            if (fs.existsSync(filePath)) {
                const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
                hasFullServiceAccount = true;
                return admin.initializeApp({
                    credential: admin.credential.cert(parsed),
                    projectId: parsed.project_id || projectId,
                });
            }
        }
        catch (err) {
            console.error(`Failed to load service account from ${filePath}:`, err);
        }
    }
    // 3. Fallback: projectId-only mode (verifies Firebase Auth ID tokens via public JWKs
    // and runs Gemini AI proxy without needing a service account key).
    console.warn(`[aboneyim_api] Initialized Firebase Admin with projectId="${projectId}" (no serviceAccountKey.json yet — Auth ID token verification and Gemini proxy work; add FIREBASE_SERVICE_ACCOUNT_JSON for Admin Firestore operations).`);
    return admin.initializeApp({ projectId });
}
exports.initFirebaseAdmin = initFirebaseAdmin;
function isServiceAccountConfigured() {
    return hasFullServiceAccount;
}
exports.isServiceAccountConfigured = isServiceAccountConfigured;
//# sourceMappingURL=initAdmin.js.map