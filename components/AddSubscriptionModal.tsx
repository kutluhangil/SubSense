import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { CURRENCIES, BRAND_COLORS, SubscriptionDetail } from "../utils/data";
import { debugLog } from "../utils/debug";
import { generatePlaceholderLogo } from "../utils/logoGenerator";
import { Subscription } from "./SubscriptionModal";
import {
  SubscriptionTemplate,
  getSuggestions,
} from "../utils/subscriptionTemplates";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SubscriptionCard from "./SubscriptionCard";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: SubscriptionDetail | null;
  onAdd: (subscription: Subscription) => Promise<void> | void;
  existingSubscriptions?: Subscription[];
}

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  service,
  onAdd,
  existingSubscriptions = [],
}: AddSubscriptionModalProps) {
  const { t } = useLanguage();

  // Custom Form State (Only used if service is null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [cycle, setCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [notes, setNotes] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [myShare, setMyShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SubscriptionTemplate[]>([]);

  // Reset Custom Form
  useEffect(() => {
    if (isOpen && !service) {
      setPrice("");
      setCurrency("USD");
      setName("");
      setCategory("Uncategorized");
      setCycle("Monthly");
      setStartDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setLogo(null);
      setError(null);
      setLoading(false);
      setIsShared(false);
      setMyShare("");
      setSuggestions([]);

      debugLog("SUBSCRIPTION_CREATE", "Custom Modal Opened");
    }
  }, [service, isOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024) {
        setError(t("add.error.logo_too_large"));
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomSave = async () => {
    if (!name.trim()) {
      setError(t("add.error.name_required"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError(t("add.error.price_invalid"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const priceVal = parseFloat(price);
      const dateObj = new Date(startDate);
      const shareVal = isShared && myShare ? parseFloat(myShare) : undefined;
      if (isShared && (!shareVal || shareVal <= 0)) {
        setError("Lütfen geçerli bir pay tutarı girin.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      const newSub: any = {
        name: name,
        price: priceVal,
        originalPrice: priceVal,
        currency: currency,
        cycle: cycle,
        nextDate: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: "default",
        status: "Active",
        billingDay: dateObj.getDate(),
        category: category,
        notes: notes,
        logo: logo || generatePlaceholderLogo(name),
        history: [priceVal],
        isShared: isShared,
        myShare: shareVal,
      };

      await onAdd(newSub);
      onClose();
    } catch (err: any) {
      setError(err.message || t("card.error.failed"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:items-center sm:p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content Wrapper */}
          <div className="relative z-10 w-[min(100vw-1rem,32rem)] sm:w-full sm:max-w-lg">
            {/* 
                            BRANCHING LOGIC:
                            If 'service' exists check -> Show Premium Card
                            If 'service' is null -> Show Custom Form
                        */}
            {service ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <SubscriptionCard
                  service={service}
                  existingSubscriptions={existingSubscriptions}
                  onAdd={onAdd}
                  onClose={onClose}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: shake ? [0, -10, 10, -10, 10, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]"
              >
                {/* Custom Form Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("add.custom_title")}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Custom Form Content */}
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
                  {/* Logo Upload */}
                  <div className="flex justify-center mb-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${logo ? "border-transparent" : "border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-full h-full object-contain bg-white rounded-xl shadow-sm"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {t("add.logo")}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>

                  {/* Name Input */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {t("add.service_name")}
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        setSuggestions(getSuggestions(val));
                      }}
                      placeholder={t("add.name_placeholder")}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      autoFocus
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setName(s.name);
                              setPrice(s.price.toString());
                              setCurrency(s.currency);
                              setCategory(s.category);
                              setCycle(s.billingCycle);
                              setSuggestions([]);
                            }}
                          >
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {s.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {s.price} {s.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("card.price")}
                      </label>
                      <input
                        type="number"
                        autoComplete="off"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("card.currency")}
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Split the Bill */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-gray-300"
                      />
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
                        <Users size={16} /> Bu ortak bir abonelik (Masrafı
                        bölüşüyoruz)
                      </div>
                    </label>

                    {isShared && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2">
                          Benim Payım
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={myShare}
                            onChange={(e) => setMyShare(e.target.value)}
                            placeholder="Örn: 50"
                            className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                          />
                          <div className="absolute right-4 top-3 text-gray-400 font-bold">
                            {currency}
                          </div>
                        </div>
                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-medium">
                          Bütçenize toplam fiyat ({price || 0} {currency})
                          yerine sizin payınız eklenecektir.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Error & Action */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}

                  <button
                    onClick={handleCustomSave}
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-white font-bold bg-gray-900 dark:bg-white dark:text-gray-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? t("add.loading") : t("add.custom_title")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
