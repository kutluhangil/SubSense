import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
  if (!admin.apps.length) admin.initializeApp();
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
  { name: "Crunchyroll", plan: "Fan" },
  { name: "Spotify", plan: "Individual Premium" },
  { name: "YouTube Premium", plan: "Individual" },
  { name: "Apple Music", plan: "Individual" },
  { name: "Xbox Game Pass", plan: "Ultimate" },
  { name: "PlayStation Plus", plan: "Extra" },
  { name: "Discord Nitro", plan: "Nitro" },
  { name: "Twitch Turbo", plan: "Turbo" },
  { name: "Microsoft 365", plan: "Personal" },
  { name: "Adobe Creative Cloud", plan: "All Apps" },
  { name: "Duolingo Super", plan: "Super (individual)" },
  { name: "ChatGPT Plus", plan: "Plus" },
  { name: "Claude Pro", plan: "Pro" },
  { name: "GitHub Copilot", plan: "Individual" },
  { name: "Figma", plan: "Professional" },
  { name: "Notion", plan: "Plus" },
  { name: "Trendyol Elite", plan: "Monthly" },
  { name: "Hepsiburada Premium", plan: "Monthly" },
  { name: "HBO Max", plan: "Ad-Free / Standard" },
  { name: "Hulu", plan: "With Ads" },
];

interface RegionPrice {
  price: number | null;
  currency: string;
  plan?: string;
}
interface GeminiPriceResult {
  tr: RegionPrice | null;
  us: RegionPrice | null;
  confidence: "high" | "medium" | "low";
}

async function callGeminiGrounded(prompt: string): Promise<string | null> {
  const key = functions.config().gemini?.key;
  if (!key) throw new Error("gemini.key not configured");

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

async function fetchAndStoreFx(db: FirebaseFirestore.Firestore): Promise<void> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v2/latest?base=USD");
    if (!res.ok) return;
    const data: any = await res.json();
    const rates = { USD: 1, ...(data.rates || {}) };
    await db.collection("priceConfig").doc("fxRates").set({
      base: "USD",
      rates,
      date: data.date || null,
      source: "frankfurter (ECB)",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("FX rates stored", Object.keys(rates).length, "currencies");
  } catch (e) {
    console.error("FX fetch failed", e);
  }
}

async function runPriceSync(): Promise<{ updated: number; changed: number }> {
  const db = getDb();
  let updated = 0;
  let changed = 0;

  for (const brand of BRANDS) {
    const prompt =
      `You are a subscription-pricing researcher. Using current web search, find the CURRENT official ` +
      `subscription price for "${brand.name}" (${brand.plan} plan) in Turkey and in the United States. ` +
      `Respond with ONLY compact JSON, no prose:\n` +
      `{"tr":{"price":<number or null>,"currency":"TRY","plan":"<tier>"},` +
      `"us":{"price":<number or null>,"currency":"USD","plan":"<tier>"},` +
      `"confidence":"high|medium|low"}\n` +
      `Use the latest 2026 prices. If a region is unknown, set that region to null.`;

    try {
      const text = await callGeminiGrounded(prompt);
      if (!text) continue;
      const parsed = parsePriceJson(text);
      if (!parsed) continue;

      const id = norm(brand.name);
      const ref = db.collection("priceCatalog").doc(id);
      const prev = (await ref.get()).data();

      const trChanged =
        prev?.tr?.price != null &&
        parsed.tr?.price != null &&
        Math.abs(prev.tr.price - parsed.tr.price) > 0.001;
      const usChanged =
        prev?.us?.price != null &&
        parsed.us?.price != null &&
        Math.abs(prev.us.price - parsed.us.price) > 0.001;
      const didChange = trChanged || usChanged;

      await ref.set({
        name: brand.name,
        tr: parsed.tr,
        us: parsed.us,
        confidence: parsed.confidence,
        source: "gemini-grounded",
        changed: didChange,
        previous: didChange ? { tr: prev?.tr ?? null, us: prev?.us ?? null } : prev?.previous ?? null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      updated++;
      if (didChange) changed++;
    } catch (e) {
      console.error(`Price sync failed for ${brand.name}`, e);
    }
  }

  await fetchAndStoreFx(db);
  console.log(`Price sync complete: ${updated} updated, ${changed} changed`);
  return { updated, changed };
}

// Weekly scheduled run (Monday 03:00 Europe/Istanbul).
export const syncPricesWeekly = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .pubsub.schedule("every monday 03:00")
  .timeZone("Europe/Istanbul")
  .onRun(async () => {
    await runPriceSync();
    return null;
  });

// Manual trigger for testing (authenticated users only).
export const triggerPriceSync = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }
    return await runPriceSync();
  });
