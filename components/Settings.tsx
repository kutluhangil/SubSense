import React, { useState, useEffect } from "react";
import {
  Bell,
  Shield,
  Eye,
  Zap,
  LogOut,
  Monitor,
  Download,
  Upload,
  FileText,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  BarChart,
  Calendar,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Subscription } from "./SubscriptionModal";
import { CURRENCY_DATA } from "../utils/currency";
import { User } from "../App";
import { useFeedback } from "../contexts/FeedbackContext";
import { updateUserSettings } from "../utils/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  requestNotificationPermission,
  getNotificationStatus,
} from "../utils/notificationService";
import { PageHeader } from "./ui";
import { functions, httpsCallable } from "../firebase/firebase";

interface SettingsProps {
  subscriptions?: Subscription[];
  onUpdateSubscriptions?: React.Dispatch<React.SetStateAction<Subscription[]>>;
  onImportSubscriptions?: (subs: Subscription[]) => Promise<number | void>;
  user?: User;
}

export default function Settings({
  subscriptions = [],
  onUpdateSubscriptions,
  onImportSubscriptions,
}: SettingsProps) {
  const { t, currentCurrency, setCurrency, currentTheme, setTheme } =
    useLanguage();
  const { currentUser, userProfile, logout, logoutAllDevices } =
    useAuth() as ReturnType<typeof useAuth> & {
      logoutAllDevices?: () => Promise<void>;
    };
  const prefs = userProfile?.preferences as Record<string, any> | undefined;

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  const [calendarCopied, setCalendarCopied] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [emailNotifs, setEmailNotifs] = useState<boolean>(
    () => prefs?.notifyEmail ?? true,
  );
  const [paymentReminders, setPaymentReminders] = useState<boolean>(() => {
    if (prefs?.notifyPayment !== undefined) {
      return Boolean(prefs.notifyPayment);
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("subsense_notify_payment") !== "false";
    }
    return true;
  });

  useEffect(() => {
    if (prefs?.notifyEmail !== undefined) {
      setEmailNotifs(Boolean(prefs.notifyEmail));
    }
    if (prefs?.notifyPayment !== undefined) {
      const nextVal = Boolean(prefs.notifyPayment);
      setPaymentReminders(nextVal);
      if (typeof window !== "undefined") {
        localStorage.setItem("subsense_notify_payment", String(nextVal));
      }
    }
  }, [prefs?.notifyEmail, prefs?.notifyPayment]);

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
    link.setAttribute("download", "aboneyim_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAll = async () => {
    if (!window.confirm(t("settings.logout_all_confirm"))) return;
    setIsLoggingOutAll(true);
    try {
      if (logoutAllDevices) {
        await logoutAllDevices();
      } else {
        await logout();
      }
    } catch (e) {
      console.error("Failed to log out all devices:", e);
      alert(t("common.error"));
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
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
    if (!currentUser) {
      setCalendarError(t("settings.calendar_login_required"));
      return;
    }
    setIsGeneratingCalendar(true);
    setCalendarError(null);
    try {
      const newToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      await updateUserSettings(currentUser.uid, { calendarToken: newToken });
    } catch (err) {
      console.error("Failed to generate calendar token:", err);
      setCalendarError(t("settings.calendar_error"));
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  const calendarUrl =
    currentUser && prefs?.calendarToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar.ics?token=${prefs.calendarToken}`
      : "";

  const handleCopyCalendarUrl = async () => {
    if (!calendarUrl) return;
    setCalendarError(null);
    try {
      await navigator.clipboard.writeText(calendarUrl);
      setCalendarCopied(true);
      setTimeout(() => setCalendarCopied(false), 2000);
    } catch {
      setCalendarError(t("settings.calendar_error"));
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || (!onImportSubscriptions && !onUpdateSubscriptions)) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
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

        let count = imported.length;
        if (onImportSubscriptions) {
          const res = await onImportSubscriptions(imported);
          if (typeof res === "number") {
            count = res;
          }
        } else if (onUpdateSubscriptions) {
          onUpdateSubscriptions((prev) => [...prev, ...imported]);
        }

        const msg = t("settings.import_success").replace(
          "{count}",
          String(count),
        );
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setToastMessage(null);
        }, 3000);
      } catch {
        alert(t("settings.import_error"));
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handlePreferenceUpdate = async (key: string, value: boolean) => {
    if (!currentUser) return;

    try {
      await updateUserSettings(currentUser.uid, { [key]: value });
    } catch (e) {
      console.error("Failed to sync preference", e);
    }
  };

  const handleEmailNotifsChange = async (nextVal: boolean) => {
    setEmailNotifs(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsense_notify_email", String(nextVal));
    }
    if (currentUser) {
      await updateUserSettings(currentUser.uid, {
        notifyEmail: nextVal,
        notifyPayment: paymentReminders,
      });
    }
  };

  const handlePaymentRemindersChange = async (nextVal: boolean) => {
    if (nextVal) {
      await requestNotificationPermission();
    }
    setPaymentReminders(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsense_notify_payment", String(nextVal));
    }
    if (currentUser) {
      await updateUserSettings(currentUser.uid, {
        notifyEmail: emailNotifs,
        notifyPayment: nextVal,
      });
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
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("settings.base_currency_label")}
                </label>
                <div className="relative w-full sm:min-w-[200px] sm:w-auto">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("settings.currency_note")}
              </p>
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
                  defaultChecked={prefs?.smartSuggestions ?? true}
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
                    {t("settings.email_notifications")}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.notify_email_desc")}
                  </p>
                </div>
                <Toggle
                  id="notify_email"
                  checked={emailNotifs}
                  onChange={handleEmailNotifsChange}
                />
              </div>
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
                  checked={paymentReminders}
                  onChange={handlePaymentRemindersChange}
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
                  defaultChecked={prefs?.notifyPrice ?? true}
                  onChange={(val) => handlePreferenceUpdate("notifyPrice", val)}
                />
              </div>
            </div>
          </div>

          {/* Calendar Sync */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">
                  {t("settings.calendar_title")}
                </h3>
              </div>
              {prefs?.calendarToken && (
                <button
                  type="button"
                  onClick={handleGenerateCalendarToken}
                  disabled={isGeneratingCalendar}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw
                    size={13}
                    className={isGeneratingCalendar ? "animate-spin" : ""}
                  />
                  {t("settings.calendar_regenerate")}
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("settings.calendar_desc")}
              </p>

              {calendarError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {calendarError}
                </p>
              )}

              {prefs?.calendarToken ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 break-all text-xs font-mono text-gray-500">
                    {calendarUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCalendarUrl}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                  >
                    {calendarCopied ? (
                      <>
                        <Check size={15} /> {t("settings.calendar_copied")}
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> {t("settings.calendar_copy")}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateCalendarToken}
                  disabled={isGeneratingCalendar}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg transition active:scale-95 disabled:opacity-60"
                >
                  {isGeneratingCalendar ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("settings.calendar_generating")}
                    </>
                  ) : (
                    t("settings.calendar_generate")
                  )}
                </button>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                {t("settings.calendar_hint")}
              </p>
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
                disabled={isLoggingOutAll}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {isLoggingOutAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}{" "}
                {t("settings.logout_all")}
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
      {(showToast || !!toastMessage) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-in slide-in-from-bottom-4 fade-in">
          <CheckCircle2
            size={18}
            className="text-green-400 dark:text-green-600"
          />
          <span className="font-medium text-sm">
            {toastMessage || t("settings.saved_toast")}
          </span>
        </div>
      )}
    </div>
  );
}

const Toggle = ({
  id,
  checked,
  defaultChecked = false,
  color = "bg-gray-900 dark:bg-blue-600",
  onChange,
}: {
  id: string;
  checked?: boolean;
  defaultChecked?: boolean;
  color?: string;
  onChange?: (val: boolean) => void;
}) => {
  const [internalEnabled, setInternalEnabled] = useState(() => {
    if (checked !== undefined) return checked;
    const saved = localStorage.getItem(`setting_${id}`);
    if (saved !== null) return JSON.parse(saved);
    return defaultChecked;
  });

  useEffect(() => {
    if (checked === undefined) {
      setInternalEnabled(defaultChecked);
    }
  }, [defaultChecked, checked]);

  const enabled = checked !== undefined ? checked : internalEnabled;

  const toggle = () => {
    const newVal = !enabled;
    if (checked === undefined) {
      setInternalEnabled(newVal);
      localStorage.setItem(`setting_${id}`, JSON.stringify(newVal));
    }
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
