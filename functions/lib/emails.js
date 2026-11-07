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
exports.sendMonthlyReports = exports.sendRenewalReminders = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
const initAdmin_1 = require("./initAdmin");
const getDb = () => {
    (0, initAdmin_1.initFirebaseAdmin)();
    return admin.firestore();
};
// Resend API key & sender are read from env or Functions config — never hardcoded in source.
// Set via: RESEND_API_KEY / RESEND_FROM_EMAIL or firebase functions:config:set resend.key="re_..."
const getResend = () => {
    var _a;
    const key = process.env.RESEND_API_KEY || ((_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.key);
    if (!key) {
        console.error("Resend API key (RESEND_API_KEY / resend.key) is not configured — skipping email send.");
        return null;
    }
    return new resend_1.Resend(key);
};
const getFromAddress = () => {
    var _a;
    return process.env.RESEND_FROM_EMAIL ||
        ((_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.from) ||
        "Aboneyim <onboarding@resend.dev>";
};
// Minimal currency-symbol map (functions is self-contained — the frontend
// utils/currency.ts is not importable here). Falls back to the raw code.
const CURRENCY_SYMBOLS = {
    USD: "$", EUR: "€", GBP: "£", TRY: "₺", JPY: "¥", CNY: "元",
    AUD: "A$", CAD: "C$", INR: "₹", BRL: "R$", RUB: "₽", KRW: "₩",
    MXN: "$", SAR: "﷼", AED: "د.إ", CHF: "Fr", SEK: "kr", NOK: "kr",
    DKK: "kr", PLN: "zł",
};
const symbolFor = (code) => CURRENCY_SYMBOLS[code] || code || "";
const FALLBACK_FX_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    TRY: 38.5,
    CAD: 1.38,
    AUD: 1.54,
    JPY: 154,
};
exports.sendRenewalReminders = functions
    .runWith({ timeoutSeconds: 300, memory: "512MB" })
    .pubsub.schedule("every day 09:00")
    .timeZone("Europe/Istanbul")
    .onRun(async (_context) => {
    var _a, _b, _c, _d;
    const db = getDb();
    const resend = getResend();
    if (!resend)
        return null;
    const fromAddress = getFromAddress();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    try {
        const usersSnap = await db.collection("users").get();
        for (const userDoc of usersSnap.docs) {
            try {
                const userData = userDoc.data();
                const email = userData.email;
                if (!email)
                    continue;
                if (((_a = userData.preferences) === null || _a === void 0 ? void 0 : _a.notifyPayment) === false ||
                    ((_b = userData.preferences) === null || _b === void 0 ? void 0 : _b.notifyEmail) === false) {
                    continue;
                }
                const lang = ((_c = userData.preferences) === null || _c === void 0 ? void 0 : _c.language) === "tr" ? "tr" : "en";
                const subsSnap = await db
                    .collection(`users/${userDoc.id}/subscriptions`)
                    .where("status", "in", ["Active", "Trial"])
                    .get();
                for (const subDoc of subsSnap.docs) {
                    const sub = subDoc.data();
                    if (sub.reminderEnabled === false)
                        continue;
                    const isTrial = sub.status === "Trial";
                    const rawTargetDate = isTrial && sub.trialEndDate ? sub.trialEndDate : sub.nextDate;
                    if (!rawTargetDate)
                        continue;
                    const subDate = new Date(rawTargetDate);
                    if (isNaN(subDate.getTime()))
                        continue;
                    const subDayStart = new Date(subDate.getFullYear(), subDate.getMonth(), subDate.getDate());
                    const daysUntil = Math.round((subDayStart.getTime() - todayStart.getTime()) / (1000 * 3600 * 24));
                    if (daysUntil === 3) {
                        const amount = sub.isShared && sub.myShare ? Number(sub.myShare) : Number(sub.price || 0);
                        const currency = (sub.currency || ((_d = userData.preferences) === null || _d === void 0 ? void 0 : _d.baseCurrency) || "USD").toUpperCase();
                        const formattedAmount = `${symbolFor(currency)}${amount.toLocaleString(lang === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} (${currency})`;
                        const greeting = userData.displayName
                            ? lang === "tr"
                                ? `Merhaba ${userData.displayName},`
                                : `Hi ${userData.displayName},`
                            : lang === "tr"
                                ? "Merhaba,"
                                : "Hi,";
                        const subject = lang === "tr"
                            ? isTrial
                                ? `Deneme Süresi Bitiyor: ${sub.name} (3 Gün Kaldı)`
                                : `Yaklaşan Ödeme: ${sub.name} (3 Gün Kaldı)`
                            : isTrial
                                ? `Trial Ending Soon: ${sub.name} (3 Days Left)`
                                : `Upcoming Payment: ${sub.name} (3 Days Left)`;
                        const html = lang === "tr"
                            ? isTrial
                                ? `
                      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:12px;color:#111827;">
                        <h2>Deneme Süresi Hatırlatıcısı</h2>
                        <p>${greeting}</p>
                        <p><strong>${sub.name}</strong> aboneliğinizin ücretsiz deneme süresi <strong>3 gün sonra</strong> sona erecek.</p>
                        <p>Yenileme Tutarı: <strong>${formattedAmount}</strong></p>
                        <p>Ücretlendirilmek istemiyorsanız deneme süresi dolmadan iptal etmeyi unutmayın!</p>
                        <br/>
                        <p style="color:#6b7280;font-size:13px;">Aboneyim Ekibi</p>
                      </div>
                    `
                                : `
                      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:12px;color:#111827;">
                        <h2>Abonelik Yenileme Hatırlatıcısı</h2>
                        <p>${greeting}</p>
                        <p><strong>${sub.name}</strong> aboneliğiniz <strong>3 gün sonra</strong> yenilenecek.</p>
                        <p>Tutar: <strong>${formattedAmount}</strong></p>
                        <p>Eğer kullanmıyorsanız iptal etmeyi unutmayın!</p>
                        <br/>
                        <p style="color:#6b7280;font-size:13px;">Aboneyim Ekibi</p>
                      </div>
                    `
                            : isTrial
                                ? `
                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:12px;color:#111827;">
                      <h2>Free Trial Ending Reminder</h2>
                      <p>${greeting}</p>
                      <p>Your free trial for <strong>${sub.name}</strong> ends in <strong>3 days</strong>.</p>
                      <p>Upcoming Charge: <strong>${formattedAmount}</strong></p>
                      <p>Remember to cancel before the trial ends if you don't wish to continue!</p>
                      <br/>
                      <p style="color:#6b7280;font-size:13px;">The Aboneyim Team</p>
                    </div>
                  `
                                : `
                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:12px;color:#111827;">
                      <h2>Subscription Renewal Reminder</h2>
                      <p>${greeting}</p>
                      <p>Your <strong>${sub.name}</strong> subscription will renew in <strong>3 days</strong>.</p>
                      <p>Amount: <strong>${formattedAmount}</strong></p>
                      <p>Don't forget to cancel if you're no longer using it!</p>
                      <br/>
                      <p style="color:#6b7280;font-size:13px;">The Aboneyim Team</p>
                    </div>
                  `;
                        await resend.emails.send({
                            from: fromAddress,
                            to: [email],
                            subject,
                            html,
                        });
                    }
                }
            }
            catch (userErr) {
                console.error(`Renewal reminder failed for user ${userDoc.id}:`, userErr);
            }
        }
    }
    catch (error) {
        console.error("Error sending reminders:", error);
    }
    return null;
});
// ── MONTHLY SPENDING REPORT (retention / lifecycle email) ───────────────────
// Runs at 09:00 on day 1 of each month. For every user with ≥1 active
// subscription, emails a short "spending report": current monthly spend (with
// live FX conversion to their base currency), the change vs. last month, and
// their most expensive subscription, with a CTA.
exports.sendMonthlyReports = functions
    .runWith({ timeoutSeconds: 300, memory: "512MB" })
    .pubsub.schedule("0 9 1 * *")
    .timeZone("Europe/Istanbul")
    .onRun(async (_context) => {
    var _a, _b;
    const db = getDb();
    const resend = getResend();
    if (!resend)
        return null;
    const fromAddress = getFromAddress();
    const APP_URL = "https://sub-sense-ashy.vercel.app";
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    // Read USD-based FX rates once before iterating users.
    let rates = Object.assign({}, FALLBACK_FX_RATES);
    try {
        const fxSnap = await db.collection("priceConfig").doc("fxRates").get();
        const docRates = fxSnap.exists ? (_a = fxSnap.data()) === null || _a === void 0 ? void 0 : _a.rates : null;
        if (docRates && typeof docRates === "object") {
            rates = Object.assign(Object.assign(Object.assign({}, FALLBACK_FX_RATES), docRates), { USD: 1 });
        }
    }
    catch (fxErr) {
        console.warn("Could not read priceConfig/fxRates, falling back to static FX rates:", fxErr);
    }
    try {
        const usersSnap = await db.collection("users").get();
        for (const userDoc of usersSnap.docs) {
            try {
                const userData = userDoc.data();
                const email = userData.email;
                if (!email) {
                    skipped++;
                    continue;
                }
                const prefs = userData.preferences || {};
                if (prefs.notifyEmail === false ||
                    prefs.monthlyReport === false ||
                    prefs.analyticsOptOut === true) {
                    skipped++;
                    continue;
                }
                const targetCurrency = (prefs.baseCurrency ||
                    prefs.currency ||
                    "TRY").toUpperCase();
                const lang = prefs.language === "tr" ? "tr" : "en";
                const isEnglish = lang === "en";
                const symbol = symbolFor(targetCurrency);
                // Fetch active subscriptions.
                const subsSnap = await db
                    .collection(`users/${userDoc.id}/subscriptions`)
                    .where("status", "==", "Active")
                    .get();
                if (subsSnap.empty) {
                    skipped++;
                    continue;
                }
                let currentMonthlySpend = 0;
                let topName = "";
                let topMonthly = -1;
                for (const subDoc of subsSnap.docs) {
                    const sub = subDoc.data();
                    const raw = sub.isShared && sub.myShare ? Number(sub.myShare) : Number(sub.price || 0);
                    const monthly = sub.cycle === "Yearly" ? raw / 12 : raw;
                    const fromCurr = (sub.currency || "USD").toUpperCase();
                    const converted = fromCurr === targetCurrency
                        ? monthly
                        : (monthly / (rates[fromCurr] || 1)) * (rates[targetCurrency] || 1);
                    currentMonthlySpend += converted;
                    if (converted > topMonthly) {
                        topMonthly = converted;
                        topName = sub.name || "";
                    }
                }
                const fmt = (n) => `${symbol}${n.toLocaleString(isEnglish ? "en-US" : "tr-TR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                })}`;
                // Comparison vs last month (undefined on first run).
                const lastMonthSpend = (_b = userData.stats) === null || _b === void 0 ? void 0 : _b.lastMonthSpend;
                let changeHtml = "";
                if (typeof lastMonthSpend === "number" && lastMonthSpend > 0) {
                    const pct = ((currentMonthlySpend - lastMonthSpend) / lastMonthSpend) * 100;
                    const rounded = Math.round(pct);
                    const up = rounded > 0;
                    const flat = rounded === 0;
                    const arrow = flat ? "→" : up ? "▲" : "▼";
                    const color = flat ? "#6b7280" : up ? "#dc2626" : "#16a34a";
                    const sign = up ? "+" : "";
                    const label = isEnglish
                        ? flat
                            ? "No change vs. last month"
                            : `${sign}${rounded}% vs. last month`
                        : flat
                            ? "Geçen aya göre değişim yok"
                            : `Geçen aya göre ${sign}${rounded}%`;
                    changeHtml = `<p style="margin:4px 0 0;font-size:15px;font-weight:600;color:${color};">${arrow} ${label}</p>`;
                }
                const total = fmt(currentMonthlySpend);
                const greeting = userData.displayName
                    ? isEnglish
                        ? `Hi ${userData.displayName},`
                        : `Merhaba ${userData.displayName},`
                    : isEnglish
                        ? "Hi,"
                        : "Merhaba,";
                const subject = isEnglish
                    ? `Your Aboneyim monthly report — ${total}/mo`
                    : `Aboneyim Aylık Karne — aylık toplam ${total}`;
                const t = isEnglish
                    ? {
                        heading: "Your monthly report",
                        intro: "Here's what your active subscriptions cost per month.",
                        totalLabel: `Total monthly spend (${targetCurrency})`,
                        topLabel: "Most expensive subscription",
                        cta: "Open Aboneyim",
                        unsub: "Don't want these emails? You can turn them off in your settings.",
                        team: "The Aboneyim Team",
                    }
                    : {
                        heading: "Aylık Karnen",
                        intro: "Aktif aboneliklerinin aylık maliyeti aşağıda özetlendi.",
                        totalLabel: `Aylık toplam harcama (${targetCurrency})`,
                        topLabel: "En pahalı aboneliğin",
                        cta: "Aboneyim'i Aç",
                        unsub: "Bu e-postaları istemiyorsan ayarlardan kapatabilirsin.",
                        team: "Aboneyim Ekibi",
                    };
                const topHtml = topName
                    ? `<p style="margin:0;font-size:13px;color:#6b7280;">${t.topLabel}</p>
               <p style="margin:2px 0 0;font-size:18px;font-weight:700;color:#111827;">${topName} — ${fmt(topMonthly)}</p>`
                    : "";
                const html = `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:8px;color:#111827;">
              <h2 style="margin:0 0 4px;font-size:22px;">${t.heading}</h2>
              <p style="margin:0 0 20px;color:#374151;font-size:15px;">${greeting}<br/>${t.intro}</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">${t.totalLabel}</p>
                <p style="margin:2px 0 0;font-size:32px;font-weight:800;color:#111827;">${total}</p>
                ${changeHtml}
              </div>
              ${topHtml ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">${topHtml}</div>` : ""}
              <a href="${APP_URL}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 28px;border-radius:10px;">${t.cta}</a>
              <p style="margin:28px 0 4px;color:#9ca3af;font-size:12px;">${t.unsub}</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">${t.team}</p>
            </div>
          `;
                await resend.emails.send({
                    from: fromAddress,
                    to: [email],
                    subject,
                    html,
                });
                sent++;
                // Persist current spend so next month can compute the comparison.
                await userDoc.ref.set({ stats: { lastMonthSpend: currentMonthlySpend } }, { merge: true });
            }
            catch (userErr) {
                failed++;
                console.error(`Monthly report failed for user ${userDoc.id}:`, userErr);
            }
        }
    }
    catch (error) {
        console.error("Error sending monthly reports:", error);
    }
    console.log(`sendMonthlyReports complete — sent: ${sent}, skipped: ${skipped}, failed: ${failed}`);
    return null;
});
//# sourceMappingURL=emails.js.map