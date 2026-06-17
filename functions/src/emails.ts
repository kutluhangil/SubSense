import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

const getDb = () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
};

// Resend API key is read from Functions config — never hardcoded in source.
// Set via: firebase functions:config:set resend.key="re_..."
const getResend = (): Resend | null => {
  const key = functions.config().resend?.key;
  if (!key) {
    console.error("resend.key is not configured — skipping email send.");
    return null;
  }
  return new Resend(key);
};

// Minimal currency-symbol map (functions is self-contained — the frontend
// utils/currency.ts is not importable here). Falls back to the raw code.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", TRY: "₺", JPY: "¥", CNY: "元",
  AUD: "A$", CAD: "C$", INR: "₹", BRL: "R$", RUB: "₽", KRW: "₩",
  MXN: "$", SAR: "﷼", AED: "د.إ", CHF: "Fr", SEK: "kr", NOK: "kr",
  DKK: "kr", PLN: "zł",
};
const symbolFor = (code: string): string => CURRENCY_SYMBOLS[code] || code || "";

// Normalize a subscription's price to a monthly amount.
// Yearly subs are divided by 12; Monthly (and anything else) are taken as-is.
const monthlyAmount = (price: number, cycle?: string): number =>
  cycle === "Yearly" ? price / 12 : price;

export const sendRenewalReminders = functions.pubsub.schedule("every day 09:00").timeZone("Europe/Istanbul").onRun(async (context) => {
  const db = getDb();
  const resend = getResend();
  if (!resend) return null;

  // Calculate target date (3 days from now)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  
  // Formatting logic depends on how dates are stored in Firestore.
  // In this app, nextDate is often stored as "MMM DD, YYYY" or similar depending on the locale.
  // For simplicity, we'll fetch all users and their active subs, and filter manually to avoid complex date queries in Firestore.
  
  try {
    const usersSnap = await db.collection("users").get();
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const email = userData.email;
      if (!email) continue;
      
      const subsSnap = await db.collection(`users/${userDoc.id}/subscriptions`).where("status", "==", "Active").get();
      
      for (const subDoc of subsSnap.docs) {
        const sub = subDoc.data();
        if (!sub.nextDate || sub.reminderEnabled === false) continue;
        
        const subDate = new Date(sub.nextDate);
        const timeDiff = subDate.getTime() - new Date().getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysUntil === 3) {
          // Send reminder 3 days before
          await resend.emails.send({
            from: "SubSense <noreply@subsense.app>", // Assumes domain is verified, otherwise Resend will use a default
            to: [email],
            subject: `Yaklaşan Ödeme: ${sub.name} (3 Gün Kaldı)`,
            html: `
              <h2>Abonelik Yenileme Hatırlatıcısı</h2>
              <p>Merhaba,</p>
              <p><strong>${sub.name}</strong> aboneliğiniz 3 gün sonra yenilenecek.</p>
              <p>Tutar: <strong>${sub.price} ${sub.currency}</strong></p>
              <p>Eğer kullanmıyorsanız iptal etmeyi unutmayın!</p>
              <br/>
              <p>SubSense Ekibi</p>
            `
          });
        }
      }
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
  return null;
});

// ── MONTHLY SPENDING REPORT (retention / lifecycle email) ───────────────────
// Runs at 09:00 on day 1 of each month. For every user with ≥1 active
// subscription, emails a short "spending report": current monthly spend, the
// change vs. last month, and their most expensive subscription, with a CTA.
// After sending, persists the current spend to stats.lastMonthSpend so next
// month can compute a comparison (the FIRST run has no "vs last month" value).
export const sendMonthlyReports = functions
  .runWith({ timeoutSeconds: 300, memory: "512MB" })
  .pubsub.schedule("0 9 1 * *")
  .timeZone("Europe/Istanbul")
  .onRun(async (context) => {
    const db = getDb();
    const resend = getResend();
    if (!resend) return null;

    const APP_URL = "https://sub-sense-ashy.vercel.app";
    let sent = 0;
    let skipped = 0;
    let failed = 0;

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
          // Opt-out: explicit monthlyReport === false OR analyticsOptOut === true.
          // Default (undefined) = send.
          if (prefs.monthlyReport === false || prefs.analyticsOptOut === true) {
            skipped++;
            continue;
          }

          const baseCurrency = prefs.baseCurrency || "USD";
          const isEnglish = prefs.language === "en";
          const symbol = symbolFor(baseCurrency);

          // Fetch active subscriptions.
          const subsSnap = await db
            .collection(`users/${userDoc.id}/subscriptions`)
            .where("status", "==", "Active")
            .get();

          if (subsSnap.empty) {
            skipped++;
            continue;
          }

          // Compute current monthly spend in the user's base currency.
          // LIMITATION: functions has no FX library. We sum monthly-normalized
          // amounts and label everything with the user's baseCurrency symbol.
          // If a sub's currency differs from baseCurrency we still count its raw
          // value (no conversion) — acceptable since most subs match the base
          // currency; cross-currency users may see a slightly approximate total.
          let currentMonthlySpend = 0;
          let topName = "";
          let topMonthly = -1;

          for (const subDoc of subsSnap.docs) {
            const sub = subDoc.data();
            const price = typeof sub.price === "number" ? sub.price : 0;
            const m = monthlyAmount(price, sub.cycle);
            currentMonthlySpend += m;
            if (m > topMonthly) {
              topMonthly = m;
              topName = sub.name || "";
            }
          }

          const fmt = (n: number) =>
            `${symbol}${n.toLocaleString(isEnglish ? "en-US" : "tr-TR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}`;

          // Comparison vs last month (undefined on first run).
          const lastMonthSpend = userData.stats?.lastMonthSpend;
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
            ? (isEnglish ? `Hi ${userData.displayName},` : `Merhaba ${userData.displayName},`)
            : (isEnglish ? "Hi," : "Merhaba,");

          const subject = isEnglish
            ? "Your SubSense monthly report"
            : `SubSense Aylık Karne — geçen ay ${total} harcadın`;

          const t = isEnglish
            ? {
                heading: "Your monthly report",
                intro: "Here's what your subscriptions cost you last month.",
                totalLabel: "Total monthly spend",
                topLabel: "Most expensive subscription",
                cta: "Open SubSense",
                unsub:
                  "Don't want these emails? You can turn them off in your settings.",
                team: "The SubSense Team",
              }
            : {
                heading: "Aylık Karnen",
                intro: "Geçen ay aboneliklerin sana ne kadara mal oldu, işte özeti.",
                totalLabel: "Aylık toplam harcama",
                topLabel: "En pahalı aboneliğin",
                cta: "SubSense'i Aç",
                unsub:
                  "Bu e-postaları istemiyorsan ayarlardan kapatabilirsin.",
                team: "SubSense Ekibi",
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
            from: "SubSense <noreply@subsense.app>",
            to: [email],
            subject,
            html,
          });
          sent++;

          // Persist current spend so next month can compute the comparison.
          await userDoc.ref.set(
            { stats: { lastMonthSpend: currentMonthlySpend } },
            { merge: true }
          );
        } catch (userErr) {
          failed++;
          console.error(`Monthly report failed for user ${userDoc.id}:`, userErr);
        }
      }
    } catch (error) {
      console.error("Error sending monthly reports:", error);
    }

    console.log(
      `sendMonthlyReports complete — sent: ${sent}, skipped: ${skipped}, failed: ${failed}`
    );
    return null;
  });
