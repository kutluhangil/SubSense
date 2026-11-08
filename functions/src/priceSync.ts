import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { initFirebaseAdmin } from "./initAdmin";

/**
 * Weekly automated price + FX refresh.
 *
 * 1. Subscription prices: there is NO official price API for Netflix/Spotify/etc,
 *    and no 3rd-party aggregator covers Turkey. The only viable automated source
 *    for TR pricing is Gemini with Google Search grounding. Results are AI-sourced
 *    so they are stored with a `confidence` flag and a `changed` flag — the app
 *    treats them as *suggestions to confirm*, never as ground truth.
 * 2. FX rates: pulled from Frankfurter (ECB official, free, no key, supports TRY)
 *    and cached in Firestore as a shared fallback for all clients.
 *
 * Deploy: firebase deploy --only functions:syncPricesWeekly,functions:triggerPriceSync
 * Requires: firebase functions:config:set gemini.key="AIza..."  (already set)
 */

const getDb = () => {
  initFirebaseAdmin();
  return admin.firestore();
};

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Brands to track. `plan` is the representative tier we want a price for.
const BRANDS: { name: string; plan: string }[] = [
  { name: "Netflix", plan: "Standard" },
  { name: "Disney+", plan: "Standard" },
  { name: "Amazon Prime", plan: "Monthly membership" },
  { name: "Exxen", plan: "Reklamsız (ad-free)" },
  { name: "BluTV", plan: "Monthly" },
  { name: "Gain", plan: "Premium Monthly" },
  { name: "Tabii", plan: "Premium Monthly" },
  { name: "Crunchyroll", plan: "Fan" },
  { name: "Spotify", plan: "Individual Premium" },
  { name: "YouTube Premium", plan: "Individual" },
  { name: "Apple Music", plan: "Individual" },
  { name: "Apple TV+", plan: "Monthly" },
  { name: "Deezer", plan: "Premium" },
  { name: "Xbox Game Pass", plan: "Ultimate" },
  { name: "PlayStation Plus", plan: "Extra" },
  { name: "GeForce Now", plan: "Performance / Priority" },
  { name: "EA Play", plan: "Monthly" },
  { name: "Ubisoft+", plan: "Classics" },
  { name: "Discord Nitro", plan: "Nitro" },
  { name: "Twitch Turbo", plan: "Turbo" },
  { name: "Microsoft 365", plan: "Personal" },
  { name: "Adobe Creative Cloud", plan: "All Apps" },
  { name: "Canva Pro", plan: "Pro Individual" },
  { name: "Duolingo Super", plan: "Super (individual)" },
  { name: "ChatGPT Plus", plan: "Plus" },
  { name: "Claude Pro", plan: "Pro" },
  { name: "Gemini Advanced", plan: "Google One AI Premium" },
  { name: "Perplexity", plan: "Pro" },
  { name: "GitHub Copilot", plan: "Individual" },
  { name: "Figma", plan: "Professional" },
  { name: "Notion", plan: "Plus" },
  { name: "Trendyol Elite", plan: "Monthly" },
  { name: "Hepsiburada Premium", plan: "Monthly" },
  { name: "HBO Max", plan: "Ad-Free / Standard" },
  { name: "Hulu", plan: "With Ads" },
];

interface TierItem {
  name: string;
  price: number;
  cycle: "Monthly" | "Yearly";
}

interface RegionPrice {
  price: number | null;
  currency: string;
  plan?: string;
  tiers?: TierItem[];
}
interface GeminiPriceResult {
  tr: RegionPrice | null;
  us: RegionPrice | null;
  confidence: "high" | "medium" | "low";
}

function getGeminiKey(): string | undefined {
  try {
    return process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  } catch {
    return process.env.GEMINI_API_KEY;
  }
}

async function callGeminiGrounded(prompt: string): Promise<string | null> {
  const key = getGeminiKey();
  if (!key) return null;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    // Google Search grounding so prices reflect the live web, not training data.
    tools: [{ google_search: {} }],
  };

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return null;
  }
  const data: any = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || null;
}

function parsePriceJson(text: string): GeminiPriceResult | null {
  // The grounded response may wrap JSON in prose / code fences. Extract first {...}.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    return {
      tr: obj.tr ?? null,
      us: obj.us ?? null,
      confidence: obj.confidence === "high" || obj.confidence === "low" ? obj.confidence : "medium",
    };
  } catch {
    return null;
  }
}

export async function fetchAndStoreFx(db?: FirebaseFirestore.Firestore): Promise<boolean> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v2/latest?base=USD");
    if (!res.ok) return false;
    const data: any = await res.json();
    const rates = { USD: 1, ...(data.rates || {}) };
    if (db) {
      await db.collection("priceConfig").doc("fxRates").set({
        base: "USD",
        rates,
        date: data.date || null,
        source: "frankfurter (ECB)",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    console.log("FX rates stored", Object.keys(rates).length, "currencies");
    return true;
  } catch (e) {
    console.error("FX fetch failed", e);
    return false;
  }
}

let lastFullSyncTime = 0;
const brandSyncTimes: Record<string, number> = {};

export async function runPriceSync(options?: {
  brands?: string[];
  force?: boolean;
}): Promise<{
  updated: number;
  changed: number;
  fxUpdated: boolean;
  geminiAvailable: boolean;
  items: Record<string, any>;
}> {
  let db: FirebaseFirestore.Firestore | undefined;
  try {
    db = getDb();
  } catch {
    db = undefined;
  }

  const fxUpdated = await fetchAndStoreFx(db);
  const geminiKey = getGeminiKey();
  const geminiAvailable = Boolean(geminiKey);
  const items: Record<string, any> = {};

  if (!geminiAvailable) {
    console.log("GEMINI_API_KEY not set; FX rates refreshed, skipping live web grounding.");
    return { updated: 0, changed: 0, fxUpdated, geminiAvailable: false, items };
  }

  let targetList = BRANDS;
  if (options?.brands && Array.isArray(options.brands) && options.brands.length > 0) {
    const requestedNorms = new Set(options.brands.slice(0, 15).map((b) => norm(String(b))));
    const matched = BRANDS.filter((b) => requestedNorms.has(norm(b.name)));
    // Also allow custom brand names passed by user
    for (const rawName of options.brands.slice(0, 15)) {
      const cleanName = String(rawName).trim();
      if (cleanName && !matched.some((m) => norm(m.name) === norm(cleanName))) {
        matched.push({ name: cleanName, plan: "Standard / Individual" });
      }
    }
    targetList = matched;
  }

  let updated = 0;
  let changed = 0;
  const now = Date.now();

  for (const brand of targetList) {
    const id = norm(brand.name);
    // Avoid hammering Gemini if synced within last 15 minutes unless forced
    if (!options?.force && brandSyncTimes[id] && now - brandSyncTimes[id] < 15 * 60 * 1000) {
      continue;
    }

    const prompt =
      `You are a subscription-pricing researcher. Using current web search, find the CURRENT official ` +
      `2026 subscription prices for "${brand.name}" (representative tier: ${brand.plan}) in Turkey (TRY) and in the United States (USD). ` +
      `Respond with ONLY compact JSON, no prose:\n` +
      `{"tr":{"price":<number or null>,"currency":"TRY","plan":"<tier>","tiers":[{"name":"<tier>","price":<number>,"cycle":"Monthly"}]},` +
      `"us":{"price":<number or null>,"currency":"USD","plan":"<tier>","tiers":[{"name":"<tier>","price":<number>,"cycle":"Monthly"}]},` +
      `"confidence":"high|medium|low"}\n` +
      `Use the latest 2026 official prices. If a region is unknown, set that region to null.`;

    try {
      const text = await callGeminiGrounded(prompt);
      if (!text) continue;
      const parsed = parsePriceJson(text);
      if (!parsed) continue;

      brandSyncTimes[id] = Date.now();
      let didChange = false;
      let prevData: any = null;

      if (db) {
        const ref = db.collection("priceCatalog").doc(id);
        prevData = (await ref.get()).data();

        const trChanged =
          prevData?.tr?.price != null &&
          parsed.tr?.price != null &&
          Math.abs(prevData.tr.price - parsed.tr.price) > 0.01;
        const usChanged =
          prevData?.us?.price != null &&
          parsed.us?.price != null &&
          Math.abs(prevData.us.price - parsed.us.price) > 0.01;
        didChange = trChanged || usChanged;

        const payload = {
          name: brand.name,
          tr: parsed.tr,
          us: parsed.us,
          confidence: parsed.confidence,
          source: "gemini-grounded",
          changed: didChange,
          previous: didChange
            ? { tr: prevData?.tr ?? null, us: prevData?.us ?? null }
            : prevData?.previous ?? null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await ref.set(payload);
        items[id] = payload;
      } else {
        items[id] = {
          name: brand.name,
          tr: parsed.tr,
          us: parsed.us,
          confidence: parsed.confidence,
          source: "gemini-grounded",
          changed: false,
        };
      }

      updated++;
      if (didChange) changed++;
    } catch (e) {
      console.error(`Price sync failed for ${brand.name}`, e);
    }
  }

  lastFullSyncTime = Date.now();
  console.log(`Price sync complete: ${updated} updated, ${changed} changed`);
  return { updated, changed, fxUpdated, geminiAvailable, items };
}

// Weekly scheduled run (Monday 03:00 Europe/Istanbul).
export const syncPricesWeekly = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .pubsub.schedule("every monday 03:00")
  .timeZone("Europe/Istanbul")
  .onRun(async () => {
    await runPriceSync({ force: true });
    return null;
  });

// On-demand trigger for logged-in users (with rate-limit cooldown) or admins.
export const triggerPriceSync = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }

    const isAdminClaim = context.auth.token.admin === true;
    const rawAdmins = process.env.ADMIN_EMAILS || "";
    const adminList = rawAdmins
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
    const callerEmail = (context.auth.token.email || "").toLowerCase();
    const isAdmin = isAdminClaim || adminList.length === 0 || adminList.includes(callerEmail);

    const requestedBrands = Array.isArray(data?.brands) ? data.brands : undefined;

    if (!requestedBrands && !isAdmin) {
      const elapsedMs = Date.now() - lastFullSyncTime;
      if (elapsedMs < 30 * 60 * 1000) {
        return {
          updated: 0,
          changed: 0,
          fxUpdated: false,
          geminiAvailable: Boolean(getGeminiKey()),
          cached: true,
          items: {},
        };
      }
    }

    return await runPriceSync({
      brands: requestedBrands,
      force: Boolean(data?.force && isAdmin),
    });
  });
