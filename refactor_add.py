import re

with open('components/AddSubscriptionModal.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = "import { SubscriptionTemplate, getSuggestions } from '../utils/subscriptionTemplates';\nimport { Users } from 'lucide-react';\n"
content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", imports + "import { motion, AnimatePresence } from 'framer-motion';")

# Add state
state_code = """    const [isShared, setIsShared] = useState(false);
    const [myShare, setMyShare] = useState<string>('');
    const [suggestions, setSuggestions] = useState<SubscriptionTemplate[]>([]);
"""
content = content.replace("const [shake, setShake] = useState(false);", "const [shake, setShake] = useState(false);\n" + state_code)

# Reset state
reset_code = """            setIsShared(false);
            setMyShare('');
            setSuggestions([]);
"""
content = content.replace("setLoading(false);", "setLoading(false);\n" + reset_code, 1)

# Modify handleCustomSave to include isShared and myShare
save_code = """
            const shareVal = isShared && myShare ? parseFloat(myShare) : undefined;
            if (isShared && (!shareVal || shareVal <= 0)) { setError("Lütfen geçerli bir pay tutarı girin."); setShake(true); setTimeout(() => setShake(false), 500); return; }

            const newSub: any = {
                name: name,
                price: priceVal,
                originalPrice: priceVal,
                currency: currency,
                cycle: cycle,
                nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                type: 'default',
                status: 'Active',
                billingDay: dateObj.getDate(),
                category: category,
                notes: notes,
                logo: logo || generatePlaceholderLogo(name),
                history: [priceVal],
                isShared: isShared,
                myShare: shareVal
            };
"""
content = re.sub(r'const newSub: any = \{.*?history: \[priceVal\]\s*\};', save_code.strip(), content, flags=re.DOTALL)

# Handle name change to show suggestions
handle_name_change = """onChange={(e) => {
                                                const val = e.target.value;
                                                setName(val);
                                                setSuggestions(getSuggestions(val));
                                            }}"""
content = content.replace("onChange={(e) => setName(e.target.value)}", handle_name_change)

# Insert suggestions UI and Split the bill UI
name_input_block_pattern = r'(<div>\s*<label.*?\{t\(\'add\.service_name\'\)\}.*?</label>\s*<input.*?autoFocus\s*/>\s*</div>)'

suggestions_and_split_ui = """
                                    <div className="relative">
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('add.service_name')}</label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            value={name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setName(val);
                                                setSuggestions(getSuggestions(val));
                                            }}
                                            placeholder={t('add.name_placeholder')}
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
                                                        <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>
                                                        <span className="text-xs text-gray-500">{s.price} {s.currency}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
"""
content = re.sub(name_input_block_pattern, suggestions_and_split_ui.strip(), content, flags=re.DOTALL)

split_bill_ui = """
                                    {/* Split the Bill */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-gray-300" />
                                            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
                                                <Users size={16} /> Bu ortak bir abonelik (Masrafı bölüşüyoruz)
                                            </div>
                                        </label>
                                        
                                        {isShared && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                                <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Benim Payım</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={myShare}
                                                        onChange={(e) => setMyShare(e.target.value)}
                                                        placeholder="Örn: 50"
                                                        className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                    />
                                                    <div className="absolute right-4 top-3 text-gray-400 font-bold">{currency}</div>
                                                </div>
                                                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-medium">Bütçenize toplam fiyat ({price || 0} {currency}) yerine sizin payınız eklenecektir.</p>
                                            </motion.div>
                                        )}
                                    </div>
"""
content = content.replace("                                    {/* Error & Action */}", split_bill_ui + "\n                                    {/* Error & Action */}")

with open('components/AddSubscriptionModal.tsx', 'w') as f:
    f.write(content)

print("AddSubscriptionModal updated successfully.")
