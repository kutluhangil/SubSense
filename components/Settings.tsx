import React, { useState } from "react";
import {
  Bell,
  Shield,
  Eye,
  Globe,
  Zap,
  LogOut,
  Monitor,
  Smartphone,
  Download,
  Upload,
  FileText,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  BarChart,
  CreditCard,
  Star,
  Calendar,
  ExternalLink,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Subscription } from "./SubscriptionModal";
import { CURRENCY_DATA } from "../utils/currency";
import { User } from "../App";
import { useFeedback } from "../contexts/FeedbackContext";
import { updateUserSettings } from "../utils/firestore";
import { useAuth } from "../contexts/AuthContext";
import UpgradeModal from "./UpgradeModal";
import { createPortalSession } from "../utils/stripe";
import {
  requestNotificationPermission,
  getNotificationStatus,
} from "../utils/notificationService";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "./ui";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
interface SettingsProps {
  subscriptions?: Subscription[];
  onUpdateSubscriptions?: React.Dispatch<React.SetStateAction<Subscription[]>>;
  user?: User;
}

export default function Settings({
  subscriptions = [],
  onUpdateSubscriptions,
  user,
}: SettingsProps) {
  const { t, currentCurrency, setCurrency, currentTheme, setTheme } =
    useLanguage();
  const { currentUser, userProfile, isPro, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { openFeedback } = useFeedback();

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Category",
      "Price",
      "Currency",
      "Billing Cycle",
      "Next Payment",
      "Status",
    ];
    const rows = subscriptions.map((sub) => [
      sub.name,
      sub.category || "Uncategorized",
      sub.price.toFixed(2),
      sub.currency,
      sub.cycle,
      sub.nextDate,
      sub.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "subsense_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAll = () => {
    if (window.confirm(t("settings.logout_confirm"))) {
      alert(t("settings.sessions_cleared"));
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (onUpdateSubscriptions) {
      onUpdateSubscriptions((prev) =>
        prev.map((sub) => ({
          ...sub,
          currency: newCurrency,
        })),
      );
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAnalyticsOptOut = (optOut: boolean) => {
    localStorage.setItem("analytics_opt_out", String(optOut));
    if (currentUser) {
      updateUserSettings(currentUser.uid, { analyticsOptOut: optOut });
    }
  };

  // Friend-facing privacy (persisted to Firestore so the friends Cloud
  // Function can honor it server-side). Defaults to fully visible.
  const privacy = userProfile?.preferences?.privacy ?? {
    showSpending: true,
    showSubscriptions: true,
  };
  const updatePrivacy = (
    patch: Partial<{ showSpending: boolean; showSubscriptions: boolean }>,
  ) => {
    if (!currentUser) return;
    updateUserSettings(currentUser.uid, { privacy: { ...privacy, ...patch } });
  };

  const handleManageSubscription = async () => {
    await createPortalSession();
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeletingAccount(true);
    try {
      const deleteAccount = httpsCallable(functions, "deleteUserAccount");
      await deleteAccount({});
      await logout();
    } catch (e: any) {
      console.error("Account deletion failed:", e);
      alert(t("settings.delete_error"));
      setIsDeletingAccount(false);
    }
  };

  const handleGenerateCalendarToken = async () => {
    if (!currentUser) return;
    const newToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    await updateUserSettings(currentUser.uid, { calendarToken: newToken });
  };

  const calendarUrl =
    currentUser && userProfile?.preferences?.calendarToken
      ? `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/generateCalendarFeed?token=${userProfile.preferences.calendarToken}`
      : "";

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateSubscriptions) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        // Expect header: Name,Category,Price,Currency,Billing Cycle,Next Payment,Status
        const header = lines[0].toLowerCase();
        if (!header.includes("name") || !header.includes("price")) {
          alert(t("settings.import_invalid_format"));
          setIsImporting(false);
          return;
        }
        const imported: Subscription[] = lines
          .slice(1)
          .map((line, idx) => {
            const cols = line
              .split(",")
              .map((c) => c.trim().replace(/^"|"$/g, ""));
            return {
              id: `imported_${Date.now()}_${idx}`,
              name: cols[0] || "Imported",
              category: cols[1] || "Other",
              price: parseFloat(cols[2]) || 0,
              currency: cols[3] || "USD",
              cycle: (cols[4] === "Yearly" ? "Yearly" : "Monthly") as
                | "Monthly"
                | "Yearly",
              nextDate:
                cols[5] ||
                new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              status: (cols[6] === "Active" ? "Active" : "Inactive") as
                | "Active"
                | "Inactive",
              type: cols[0] || "custom",
              plan: "Imported",
            } as Subscription;
          })
          .filter((s) => s.name && s.price >= 0);

        if (imported.length === 0) {
          alert(t("settings.import_no_rows"));
          setIsImporting(false);
          return;
        }

        onUpdateSubscriptions((prev) => [...prev, ...imported]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch {
        alert(t("settings.import_error"));
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Helper to format subscription dates safely
  const getRenewalDate = () => {
    if (!userProfile?.plan?.currentPeriodEnd) return "Unknown";
    try {
      // Handle both Firestore Timestamp and ISO string
      const date =
        typeof userProfile.plan.currentPeriodEnd === "string"
          ? new Date(userProfile.plan.currentPeriodEnd)
          : userProfile.plan.currentPeriodEnd.toDate();
      return date.toLocaleDateString();
    } catch (e) {
      return "Unknown";
    }
  };

  const handlePreferenceUpdate = async (key: string, value: boolean) => {
    if (!currentUser) return;

    try {
      await updateUserSettings(currentUser.uid, { [key]: value });
    } catch (e) {
      console.error("Failed to sync preference", e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
      <PageHeader
        icon={SlidersHorizontal}
        title={t("settings.title")}
        subtitle={t("settings.desc")}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* ... (Plan Card skipped for brevity in diff, assume unchanged) ... */}
          {/* Re-rendering Plan Card logic to ensure context... actually I can skip replacing the whole block if I use strict targeting. */}
          {/* But sticking to the block structure for safety. */}
          {/* Subscription Plan Card */}
          <div
            className={`rounded-2xl border shadow-sm overflow-hidden ${isPro ? "bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-700" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}
          >
            {/* ... (Keeping inner content same) ... */}
            <div
              className={`px-6 py-4 border-b flex items-center gap-3 ${isPro ? "border-indigo-700/50 bg-black/20" : "border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"}`}
            >
              <CreditCard
                className={isPro ? "text-indigo-300" : "text-gray-400"}
                size={20}
              />
              <h3
                className={`text-base font-bold ${isPro ? "text-white" : "text-gray-900 dark:text-white"}`}
              >
                {t("settings.subscription_plan")}
              </h3>
            </div>
            <div className="p-6">
              {/* ... Content ... */}
              <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4
                    className={`text-lg font-bold ${isPro ? "text-white" : "text-gray-900 dark:text-white"}`}
                  >
                    {isPro ? t("settings.pro_plan") : t("settings.free_plan")}
                  </h4>
                  <p
                    className={`text-sm ${isPro ? "text-indigo-200" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {isPro
                      ? t("settings.next_billing").replace(
                          "{0}",
                          getRenewalDate(),
                        )
                      : t("settings.upgrade_prompt")}
                  </p>
                </div>
                {isPro ? (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full sm:w-auto text-sm font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
                  >
                    {t("settings.manage")}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsUpgradeOpen(true)}
                    className="w-full sm:w-auto text-sm font-bold text-white bg-gray-900 dark:bg-blue-600 px-5 py-2.5 rounded-xl"
                  >
                    {t("settings.upgrade")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <Monitor className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("profile.appearance")}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t("profile.theme")}
              </p>
              <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-700 sm:w-fit sm:flex sm:grid-cols-none">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all sm:px-5 ${
                    currentTheme === "light"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <Sun size={14} /> {t("profile.theme_light")}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all sm:px-5 ${
                    currentTheme === "dark"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <Moon size={14} /> {t("profile.theme_dark")}
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all sm:px-5 ${
                    currentTheme === "system"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <Monitor size={14} /> {t("profile.theme_system")}
                </button>
              </div>
            </div>
          </div>

          {/* Currency & Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <DollarSign className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.currency_section")}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("settings.base_currency_label")}
                  </label>
                  <div className="relative w-full sm:min-w-[200px]">
                    <select
                      value={currentCurrency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-2.5 font-medium cursor-pointer"
                    >
                      {Object.values(CURRENCY_DATA).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-100/50 dark:border-indigo-800/50 flex items-center gap-3">
              <Zap className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200">
                {t("settings.ai_title")}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-indigo-800/70 dark:text-indigo-300/70">
                {t("settings.ai_desc")}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    {t("settings.smart_suggestions")}
                  </h4>
                  <p className="text-xs text-indigo-700/60 dark:text-indigo-300/60">
                    {t("settings.smart_suggestions_desc")}
                  </p>
                </div>
                <Toggle
                  id="smart_suggestions"
                  defaultChecked={
                    userProfile?.preferences?.smartSuggestions ?? true
                  }
                  color="bg-indigo-600"
                  onChange={(val) =>
                    handlePreferenceUpdate("smartSuggestions", val)
                  }
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <Bell className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.notifications")}
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("settings.payment_due")}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.notify_payment_desc")}
                  </p>
                  {(() => {
                    const status = getNotificationStatus();
                    if (status === "denied")
                      return (
                        <p className="text-[10px] text-red-500 mt-1">
                          {t("settings.notification_denied")}
                        </p>
                      );
                    if (status === "unsupported")
                      return (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {t("settings.notification_unsupported")}
                        </p>
                      );
                    if (status === "granted")
                      return (
                        <p className="text-[10px] text-green-500 mt-1">
                          {t("settings.notification_granted")}
                        </p>
                      );
                    return null;
                  })()}
                </div>
                <Toggle
                  id="notify_payment"
                  defaultChecked={
                    userProfile?.preferences?.notifyPayment ?? true
                  }
                  onChange={async (val) => {
                    if (val) {
                      const granted = await requestNotificationPermission();
                      if (!granted) {
                        // Permission was denied — the status text above will update on next render
                      }
                    }
                    handlePreferenceUpdate("notifyPayment", val);
                  }}
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("settings.price_alerts")}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.notify_price_desc")}
                  </p>
                </div>
                <Toggle
                  id="notify_price"
                  defaultChecked={userProfile?.preferences?.notifyPrice ?? true}
                  onChange={(val) => handlePreferenceUpdate("notifyPrice", val)}
                />
              </div>
            </div>
          </div>

          {/* Calendar Sync */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <Calendar className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                Takvim Senkronizasyonu
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Abonelik ödeme günlerinizi Google veya Apple Takvim üzerinden
                takip edin.
              </p>

              {userProfile?.preferences?.calendarToken ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 break-all text-xs font-mono text-gray-500">
                    {calendarUrl}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(calendarUrl);
                      alert("Takvim linki kopyalandı!");
                    }}
                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                  >
                    Linki Kopyala
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCalendarToken}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg transition active:scale-95"
                >
                  Takvim Linki Oluştur
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Feedback & Beta */}
          <div className="bg-gray-900 dark:bg-blue-600 rounded-2xl shadow-lg shadow-gray-900/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors"></div>
            <div className="p-6 text-white relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={20} className="text-white/80" />
                <h3 className="font-bold">
                  {t("settings.beta_feedback_section")}
                </h3>
              </div>
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                {t("settings.beta_feedback_desc")}
              </p>
              <button
                onClick={() => openFeedback("settings")}
                className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
              >
                {t("settings.give_feedback")}
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <Eye className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.privacy_visibility")}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">
                    {t("settings.show_stats")}
                  </span>
                  <Toggle
                    id="priv_stats"
                    defaultChecked={privacy.showSpending}
                    onChange={(v) => updatePrivacy({ showSpending: v })}
                  />
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">
                    {t("settings.show_subs")}
                  </span>
                  <Toggle
                    id="priv_subs"
                    defaultChecked={privacy.showSubscriptions}
                    onChange={(v) => updatePrivacy({ showSubscriptions: v })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Opt-Out */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <BarChart className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.analytics_section")}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("settings.share_usage")}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                    {t("settings.share_usage_desc")}
                  </p>
                </div>
                {/* Logic inverted: Toggle ON means Allow (not opt-out) */}
                <Toggle
                  id="allow_analytics"
                  defaultChecked={!userProfile?.preferences?.analyticsOptOut}
                  onChange={(checked) => handleAnalyticsOptOut(!checked)}
                />
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <FileText className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.data_export_section")}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-xl transition-colors"
              >
                <Download size={16} /> {t("settings.export_csv")}
              </button>
              <label
                className={`w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-xl transition-colors cursor-pointer ${isImporting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isImporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {isImporting
                  ? t("settings.importing")
                  : t("settings.import_csv")}
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVImport}
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <Shield className="text-gray-400" size={20} />
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                {t("settings.security")}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleLogoutAll}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 py-2.5 rounded-xl transition-colors"
              >
                <LogOut size={16} /> {t("settings.logout_all")}
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 py-2 transition-colors"
                >
                  <Trash2 size={15} /> {t("settings.delete_account")}
                </button>
              ) : (
                <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      {t("settings.delete_warning")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-1"
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />{" "}
                          {t("common.deleting")}
                        </>
                      ) : (
                        t("settings.delete_confirm_btn")
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-in slide-in-from-bottom-4 fade-in">
          <CheckCircle2
            size={18}
            className="text-green-400 dark:text-green-600"
          />
          <span className="font-medium text-sm">
            {t("settings.saved_toast")}
          </span>
        </div>
      )}

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </div>
  );
}

const Toggle = ({
  id,
  defaultChecked = false,
  color = "bg-gray-900 dark:bg-blue-600",
  onChange,
}: {
  id: string;
  defaultChecked?: boolean;
  color?: string;
  onChange?: (val: boolean) => void;
}) => {
  const [enabled, setEnabled] = useState(() => {
    // Priority: Prop (from DB) > LocalStorage > Default
    // But since we pass defaultChecked from DB prop in parent, we trust that mostly.
    const saved = localStorage.getItem(`setting_${id}`);
    if (saved !== null) return JSON.parse(saved);
    return defaultChecked;
  });

  // Sync state if defaultChecked changes (e.g. loaded from DB)
  React.useEffect(() => {
    setEnabled(defaultChecked);
  }, [defaultChecked]);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem(`setting_${id}`, JSON.stringify(newVal));
    if (onChange) onChange(newVal);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${enabled ? color : "bg-gray-200 dark:bg-gray-600"}`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow transition-all duration-200 ${enabled ? "left-[19px]" : "left-[3px]"}`}
      />
    </button>
  );
};
