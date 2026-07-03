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
exports.triggerPriceSync = exports.syncPricesWeekly = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
    if (!admin.apps.length)
        admin.initializeApp();
    return admin.firestore();
};
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// Brands to track. `plan` is the representative tier we want a price for.
const BRANDS = [
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
async function callGeminiGrounded(prompt) {
    var _a, _b, _c, _d, _e;
    const key = (_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key;
    if (!key)
        throw new Error("gemini.key not configured");
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
    const data = await res.json();
    return ((_e = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e.map((p) => p.text).join("")) || null;
}
function parsePriceJson(text) {
    var _a, _b;
    // The grounded response may wrap JSON in prose / code fences. Extract first {...}.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        return null;
    try {
        const obj = JSON.parse(match[0]);
        return {
            tr: (_a = obj.tr) !== null && _a !== void 0 ? _a : null,
            us: (_b = obj.us) !== null && _b !== void 0 ? _b : null,
            confidence: obj.confidence === "high" || obj.confidence === "low" ? obj.confidence : "medium",
        };
    }
    catch (_c) {
        return null;
    }
}
async function fetchAndStoreFx(db) {
    try {
        const res = await fetch("https://api.frankfurter.dev/v2/latest?base=USD");
        if (!res.ok)
            return;
        const data = await res.json();
        const rates = Object.assign({ USD: 1 }, (data.rates || {}));
        await db.collection("priceConfig").doc("fxRates").set({
            base: "USD",
            rates,
            date: data.date || null,
            source: "frankfurter (ECB)",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("FX rates stored", Object.keys(rates).length, "currencies");
    }
    catch (e) {
        console.error("FX fetch failed", e);
    }
}
async function runPriceSync() {
    var _a, _b, _c, _d, _e, _f, _g;
    const db = getDb();
    let updated = 0;
    let changed = 0;
    for (const brand of BRANDS) {
        const prompt = `You are a subscription-pricing researcher. Using current web search, find the CURRENT official ` +
            `subscription price for "${brand.name}" (${brand.plan} plan) in Turkey and in the United States. ` +
            `Respond with ONLY compact JSON, no prose:\n` +
            `{"tr":{"price":<number or null>,"currency":"TRY","plan":"<tier>"},` +
            `"us":{"price":<number or null>,"currency":"USD","plan":"<tier>"},` +
            `"confidence":"high|medium|low"}\n` +
            `Use the latest 2026 prices. If a region is unknown, set that region to null.`;
        try {
            const text = await callGeminiGrounded(prompt);
            if (!text)
                continue;
            const parsed = parsePriceJson(text);
            if (!parsed)
                continue;
            const id = norm(brand.name);
            const ref = db.collection("priceCatalog").doc(id);
            const prev = (await ref.get()).data();
            const trChanged = ((_a = prev === null || prev === void 0 ? void 0 : prev.tr) === null || _a === void 0 ? void 0 : _a.price) != null &&
                ((_b = parsed.tr) === null || _b === void 0 ? void 0 : _b.price) != null &&
                Math.abs(prev.tr.price - parsed.tr.price) > 0.001;
            const usChanged = ((_c = prev === null || prev === void 0 ? void 0 : prev.us) === null || _c === void 0 ? void 0 : _c.price) != null &&
                ((_d = parsed.us) === null || _d === void 0 ? void 0 : _d.price) != null &&
                Math.abs(prev.us.price - parsed.us.price) > 0.001;
            const didChange = trChanged || usChanged;
            await ref.set({
                name: brand.name,
                tr: parsed.tr,
                us: parsed.us,
                confidence: parsed.confidence,
                source: "gemini-grounded",
                changed: didChange,
                previous: didChange ? { tr: (_e = prev === null || prev === void 0 ? void 0 : prev.tr) !== null && _e !== void 0 ? _e : null, us: (_f = prev === null || prev === void 0 ? void 0 : prev.us) !== null && _f !== void 0 ? _f : null } : (_g = prev === null || prev === void 0 ? void 0 : prev.previous) !== null && _g !== void 0 ? _g : null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            updated++;
            if (didChange)
                changed++;
        }
        catch (e) {
            console.error(`Price sync failed for ${brand.name}`, e);
        }
    }
    await fetchAndStoreFx(db);
    console.log(`Price sync complete: ${updated} updated, ${changed} changed`);
    return { updated, changed };
}
// Weekly scheduled run (Monday 03:00 Europe/Istanbul).
exports.syncPricesWeekly = functions
    .runWith({ timeoutSeconds: 540, memory: "512MB" })
    .pubsub.schedule("every monday 03:00")
    .timeZone("Europe/Istanbul")
    .onRun(async () => {
    await runPriceSync();
    return null;
});
// Manual trigger for testing (authenticated users only).
exports.triggerPriceSync = functions
    .runWith({ timeoutSeconds: 540, memory: "512MB" })
    .https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }
    return await runPriceSync();
});
//# sourceMappingURL=priceSync.js.map