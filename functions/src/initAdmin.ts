import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let hasFullServiceAccount = false;

export function initFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "subscriptionhub-85b02";

  // 1. Check inline JSON or Base64 env var: FIREBASE_SERVICE_ACCOUNT_JSON
  const rawJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
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
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    }
  }

  // 2. Check serviceAccountKey.json file path
  const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.resolve(process.cwd(), "serviceAccountKey.json"),
    path.resolve(process.cwd(), "../serviceAccountKey.json"),
    "/app/serviceAccountKey.json",
  ].filter(Boolean) as string[];

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
    } catch (err) {
      console.error(`Failed to load service account from ${filePath}:`, err);
    }
  }

  // 3. Fallback: projectId-only mode (verifies Firebase Auth ID tokens via public JWKs
  // and runs Gemini AI proxy without needing a service account key).
  console.warn(
    `[aboneyim_api] Initialized Firebase Admin with projectId="${projectId}" (no serviceAccountKey.json yet — Auth ID token verification and Gemini proxy work; add FIREBASE_SERVICE_ACCOUNT_JSON for Admin Firestore operations).`
  );
  return admin.initializeApp({ projectId });
}

export function isServiceAccountConfigured(): boolean {
  return hasFullServiceAccount;
}

