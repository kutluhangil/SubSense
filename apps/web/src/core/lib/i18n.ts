// Lightweight i18n for SubSense. No deps — keyed off `settings.language` (Zustand).
// Two languages shipped: English + Turkish. Device language auto-detected on first run.

import { useApp } from '../store/app';
import type { Category, SubStatus, Cycle } from '../types';

export type Lang = 'en' | 'tr';

/** Languages the UI fully supports (Settings picker is limited to these). */
export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

/** Detect device language on first launch; falls back to English. */
export function detectLang(): Lang {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language || (navigator.languages && navigator.languages[0]) : '';
    return nav && nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

type Dict = Record<string, string>;

const EN: Dict = {
  // nav
  'nav.home': 'Home', 'nav.subs': 'Subs', 'nav.add': 'Add', 'nav.insights': 'Insights', 'nav.profile': 'Profile',
  // common
  'common.cancel': 'Cancel', 'common.save': 'Save', 'common.edit': 'Edit', 'common.remove': 'Remove',
  'common.delete': 'Delete', 'common.seeAll': 'See All', 'common.viewAll': 'View All', 'common.from': 'From',
  'common.startingAt': 'Starting at', 'common.perMo': '/mo', 'common.perYr': '/yr', 'common.search': 'Search…',
  'common.active': 'Active', 'common.inactive': 'Inactive', 'common.close': 'Close', 'common.back': 'Back',
  // greeting
  'greeting.morning': 'Good morning', 'greeting.afternoon': 'Good afternoon', 'greeting.evening': 'Good evening',
  // categories
  'cat.Entertainment': 'Entertainment', 'cat.Productivity': 'Productivity', 'cat.Tools': 'Tools',
  'cat.Music': 'Music', 'cat.Gaming': 'Gaming', 'cat.Health & Fitness': 'Health & Fitness', 'cat.Shopping': 'Shopping',
  // status
  'status.Active': 'Active', 'status.Trial': 'Trial', 'status.Expiring': 'Expiring', 'status.Inactive': 'Inactive',
  // cycle
  'cycle.Monthly': 'Monthly', 'cycle.Yearly': 'Yearly',
  // home
  'home.alertOver': '{cat} is {over} over budget this month.', 'home.clearAll': 'Clear All',
  'home.totalMonthly': 'Total Monthly Spend', 'home.activeSubs': 'Active Subs', 'home.projectedAnnual': 'Projected Annual',
  'home.aiInsight': 'AI Insight', 'home.aiInsightBody': 'Save {amount}/mo — you have overlapping music services ({names}).',
  'home.reviewDetails': 'Review Details', 'home.exploreTitle': 'Explore Subscriptions', 'home.activeSubsTitle': 'Active Subs',
  'home.noneInCategory': 'No subscriptions in this category.',
  'home.emptyTitle': 'No subscriptions yet', 'home.emptyBody': 'Add your subscriptions to track spending, renewals and savings.', 'home.addFirst': 'Add your first subscription',
  'home.clearTitle': 'Clear all alerts?',
  'home.clearBody': "This will dismiss all current 'Action Required' notifications from your dashboard. This action cannot be undone.",
  // chips (home filter)
  'chip.All': 'All',
  // subs
  'subs.title': 'Subscriptions', 'subs.activeServices': '{n} Active Services', 'subs.totalMo': 'Total / Mo',
  'subs.searchPlaceholder': 'Search subscriptions...', 'subs.paid': 'Paid', 'subs.pending': 'Pending',
  'subs.sortDate': 'Next date', 'subs.sortPrice': 'Price', 'subs.sortName': 'Name', 'subs.none': 'No subscriptions found.',
  'subs.removeTitle': 'Remove subscription?',
  'subs.removeBody': 'This will permanently remove {name} from your SubSense dashboard. This action cannot be undone.',
  // explore
  'explore.title': 'Explore Subscriptions', 'explore.subtitle': 'Discover new services tailored to your digital life.',
  'explore.find': 'Find a service…', 'explore.featured': 'Featured', 'explore.none': 'No services found for "{q}"',
  'chip.Streaming': 'Streaming', 'chip.Design': 'Design', 'chip.AI': 'AI', 'chip.SaaS': 'SaaS',
  'chip.Learning': 'Learning', 'chip.Turkish': 'Türkçe',
  // service profile
  'svc.notFound': 'Service not found.', 'svc.startingAt': 'Starting at', 'svc.free': 'Free',
  'svc.visitWebsite': 'Visit Website', 'svc.addToSubs': 'Add to my subscriptions', 'svc.est': 'Est.',
  'svc.ceo': 'CEO', 'svc.founders': 'Founders', 'svc.globalUsers': 'Global Users', 'svc.valuation': 'Valuation',
  'svc.unitedStates': 'United States', 'svc.turkiye': 'Türkiye', 'svc.noRegion': 'No regional pricing available.',
  'svc.milestones': 'Key Milestones',
  // add / edit
  'add.addSub': 'Add Sub', 'add.editSub': 'Edit Sub', 'add.catalog': 'Catalog', 'add.custom': 'Custom',
  'add.searchPlaceholder': 'Search subscriptions...', 'add.results': 'Results', 'add.popular': 'Popular Services',
  'add.categories': 'Categories', 'add.browseTitle': 'Browse full catalog', 'add.browseSub': 'Explore 40+ services with full details',
  'add.allServices': 'All services', 'add.choosePlan': 'Choose a plan',
  'add.fieldName': 'Service Name', 'add.fieldPlan': 'Plan / Nickname', 'add.fieldPrice': 'Price',
  'add.fieldCurrency': 'Currency', 'add.fieldCycle': 'Billing Cycle', 'add.fieldStatus': 'Status',
  'add.fieldNext': 'Next Charge', 'add.fieldCategory': 'Category', 'add.fieldPayment': 'Payment Method',
  'add.fieldNotes': 'Notes', 'add.notesPlaceholder': 'Anything to remember...', 'add.reminder': 'Renewal reminder',
  'add.errName': 'Please enter a service name.', 'add.errPrice': 'Enter a price greater than 0.',
  'add.errPriceMax': 'That price looks too high.', 'add.errDate': 'Pick a valid date.',
  // detail
  'detail.notFound': 'Subscription not found.', 'detail.nextCharge': 'Next Charge', 'detail.status': 'Status',
  'detail.paymentMethod': 'Payment Method', 'detail.notSet': 'Not set', 'detail.priceHistory': 'Price History (12m)',
  'detail.notes': 'Notes', 'detail.editSub': 'Edit Subscription', 'detail.markPaid': 'Mark as Paid',
  'detail.deleteSub': 'Delete Subscription', 'detail.deleteTitle': 'Delete Subscription?',
  'detail.deleteBody': 'This will permanently remove {name} from your SubSense dashboard. This action cannot be undone.',
  // insights
  'ins.title': 'Insights', 'ins.thisMonth': 'This Month', 'ins.thisYear': 'This Year', 'ins.totalSpend': 'Total Spend',
  'ins.savingsGoal': 'Savings Goal', 'ins.saved': 'Saved', 'ins.savingsBody': 'You are 75% to your new iPad goal.',
  'ins.categories': 'Categories', 'ins.intelligence': 'Intelligence',
  'ins.compareBody': 'You pay {pct} than the world average for Spotify Premium.', 'ins.compareLess': '12% less',
  'ins.redundant': 'Redundant Services Detected',
  'ins.overlapBody': '{names} overlap — keep one and save {amount}/mo.',
  'ins.noData': 'Add subscriptions to see your insights.',
  'ins.exportReport': 'Export Report',
  'ins.forecast': '12-Month Forecast', 'ins.forecastBody': 'Projected spend — taller bars are months an annual plan renews.',
  // profile
  'prof.premiumMember': 'Premium Member', 'prof.activeSubs': 'Active Subs', 'prof.monthlySpend': 'Monthly Spend',
  'prof.freePlan': 'Free plan', 'prof.achievements': 'Achievements', 'prof.settings': 'Settings',
  'prof.settingsSub': 'Preferences & account', 'prof.refer': 'Refer a Friend', 'prof.referSub': 'Earn a free month of Pro',
  'prof.community': 'Join the Community', 'prof.communitySub': 'Share tips and tricks',
  // achievements
  'ach.first-step.t': 'First Step', 'ach.first-step.d': 'Added first sub',
  'ach.power-user.t': 'Power User', 'ach.power-user.d': '10+ active subs',
  'ach.savvy-saver.t': 'Savvy Saver', 'ach.savvy-saver.d': 'Saved $100',
  'ach.long-term.t': 'Long-Term Thinker', 'ach.long-term.d': '1 year streak',
  'ach.streamer.t': 'Streamer', 'ach.streamer.d': '5 video subs',
  // settings
  'set.title': 'Settings', 'set.preferences': 'Preferences', 'set.baseCurrency': 'Base Currency',
  'set.appLanguage': 'App Language', 'set.appearance': 'Appearance', 'set.appearanceDark': 'Dark',
  'set.appearanceLight': 'Light', 'set.appearanceSystem': 'System', 'set.accountAlerts': 'Account & Alerts',
  'set.notifications': 'Notifications', 'set.renewalAlerts': 'Renewal Alerts', 'set.pro': 'SubSense Pro',
  'set.appLock': 'App Lock', 'set.appLockDesc': 'Require biometric unlock',
  'lock.title': 'SubSense Locked', 'lock.subtitle': 'Unlock to see your subscriptions', 'lock.unlock': 'Unlock', 'lock.reason': 'Unlock SubSense',
  'set.more': 'More', 'set.privacy': 'Privacy Policy', 'set.help': 'Help & Support',
  'set.loadSample': 'Load Sample Data', 'set.clearData': 'Clear All Data',
  'set.clearTitle': 'Clear all data?', 'set.clearBody': 'This permanently deletes all your subscriptions and resets the app. This cannot be undone.',
  'set.signOut': 'Sign Out',
  'set.data': 'Backup & Data',
  'set.exportBackup': 'Export Backup', 'set.importBackup': 'Restore from Backup',
  'set.importTitle': 'Restore from backup?',
  'set.importBody': 'This replaces your current subscriptions with the ones in the backup file. This cannot be undone.',
  'set.importDone': 'Restored {count} subscriptions', 'set.importFail': 'Not a valid SubSense backup file.',
  'common.restore': 'Restore',
  // onboarding
  'onb.skip': 'Skip', 'onb.heroTitle': 'Take control of your subscriptions.',
  'onb.heroBody': 'Track every recurring service — in your currency — with AI that tells you exactly what to cut.',
  'onb.marquee': 'Netflix · Spotify · ChatGPT · Disney+ · Xbox · 40+ more',
  'onb.f1t': 'See every subscription', 'onb.f1b': 'We surface every recurring charge in one tidy place.',
  'onb.f2t': 'Your real currency', 'onb.f2b': 'Live exchange rates keep your totals always accurate.',
  'onb.f3t': 'AI finds what to cancel', 'onb.f3b': 'Spot unused services and sneaky price hikes — and save.',
  'onb.getStarted': 'Get Started', 'onb.haveAccount': 'I already have an account',
  'onb.rot1': 'Take control of your subscriptions.', 'onb.rot2': 'Never miss a renewal again.', 'onb.rot3': 'Cut what you don\'t use.',
  'onb.privacy': 'Private · stored on your device',
  // auth
  'auth.tagline': 'Control your subscriptions.', 'auth.fullName': 'Full Name', 'auth.baseCurrency': 'Base Currency',
  'auth.profileTitle': 'Create your profile', 'auth.profileSubtitle': 'No account needed — everything stays on this device.',
  'auth.nameOptional': 'Full Name (optional)', 'auth.namePlaceholder': 'Jane', 'auth.getStarted': 'Get Started',
  'auth.google': 'Continue with Google', 'auth.googleNote': 'Sync your subscriptions across devices. Optional.',
  'auth.or': 'or', 'auth.continueLocal': 'Continue without account',
  'auth.cloudNotReady': 'Cloud sync isn\'t set up in this build yet.', 'auth.googleFailed': 'Google sign-in failed. Please try again.',
  'set.account': 'Account', 'set.signInGoogle': 'Sign in with Google', 'set.syncDesc': 'Back up and sync across your devices',
  'set.syncedAs': 'Synced', 'set.signOutCloud': 'Sign out',
  'set.deleteAccount': 'Delete account', 'set.deleteAccountBusy': 'Deleting…',
  'set.deleteAccountTitle': 'Delete your account?',
  'set.deleteAccountBody': 'This permanently deletes your cloud account and all data synced to it. This cannot be undone. Subscriptions stored on this device are kept — use “Clear Data” to remove those.',
  'set.deleteAccountDone': 'Your account and cloud data were deleted.',
  'set.deleteAccountFail': 'Couldn\'t delete your account. Please try again.',
  'set.deleteReauth': 'Please sign in again, then retry deleting your account.',
  // calendar
  'cal.title': 'Renewal Calendar', 'cal.weekly': 'Weekly', 'cal.upcoming': 'Upcoming', 'cal.monthly': 'Monthly',
  'cal.estimated': 'Estimated', 'cal.next7': 'Next 7 days', 'cal.renewalsTitle': '{label} Renewals',
  'cal.noRenewals': 'No renewals on this day', 'cal.dueToday': 'Due Today', 'cal.autoRenew': 'Auto-renew',
  // compare
  'cmp.title': 'Regional Pricing', 'cmp.liveRates': 'Live Rates',
  'cmp.subtitle': 'Compare global subscription costs converted to USD.', 'cmp.individualPlan': 'Individual Plan',
  'cmp.insight': 'SubSense Insight',
  'cmp.insightBody': 'This service is {cheaper} in Turkey. Consider utilizing regional payment methods if applicable to your billing address.',
  'cmp.cheaper': '82% cheaper', 'cmp.mapView': 'Map View', 'cmp.yourRegion': 'Your Region (USA)',
  'cmp.cheapest': 'Cheapest (IND)', 'cmp.since': '+15% since 2023', 'cmp.priceHistory': 'Price History (USD Equivalent)',
  'cmp.exploreRegions': 'Explore All Regions',
  // ai chat
  // upgrade
  'up.pro': 'SubSense Pro', 'up.heroTitle': 'Master your money with', 'up.heroPro': 'Pro',
  'up.heroBody': 'Unlock advanced analytics and AI-driven insights to optimize your subscriptions.',
  'up.f1t': 'Unlimited Subscriptions', 'up.f1b': 'Track everything without limits.',
  'up.f2t': 'AI Insights', 'up.f2b': 'Smart suggestions to save money.',
  'up.f3t': 'Advanced Analytics', 'up.f3b': 'Deep dive into your spending habits.',
  'up.monthly': 'Monthly', 'up.yearly': 'Yearly', 'up.bestValue': 'Best Value', 'up.save33': 'Save 33%',
  'up.cta': 'Upgrade to Pro', 'up.restore': 'Restore Purchases',
  // subrow
  'row.next': 'Next', 'row.expiring': 'Expiring', 'row.actionRequired': 'Action Required',
  // notifications
  'notif.title': '{name} renews soon', 'notif.body': '{amount} · renews {date}',
  'notif.priceTitle': 'Price increase', 'notif.priceBody': '{name} is now {price}.',
  'ins.priceUp': 'Price increases', 'ins.priceUpBody': '{name}: {from} → {to}',
  'common.dismiss': 'Dismiss',
  'widget.monthly': 'Monthly', 'widget.next': 'Next', 'widget.empty': 'No subscriptions yet',
};

const TR: Dict = {
  // nav
  'nav.home': 'Ana Sayfa', 'nav.subs': 'Abonelikler', 'nav.add': 'Ekle', 'nav.insights': 'Analiz', 'nav.profile': 'Profil',
  // common
  'common.cancel': 'İptal', 'common.save': 'Kaydet', 'common.edit': 'Düzenle', 'common.remove': 'Kaldır',
  'common.delete': 'Sil', 'common.seeAll': 'Tümü', 'common.viewAll': 'Tümünü Gör', 'common.from': 'Başlangıç',
  'common.startingAt': 'Başlangıç', 'common.perMo': '/ay', 'common.perYr': '/yıl', 'common.search': 'Ara…',
  'common.active': 'Aktif', 'common.inactive': 'Pasif', 'common.close': 'Kapat', 'common.back': 'Geri',
  // greeting
  'greeting.morning': 'Günaydın', 'greeting.afternoon': 'İyi günler', 'greeting.evening': 'İyi akşamlar',
  // categories
  'cat.Entertainment': 'Eğlence', 'cat.Productivity': 'Verimlilik', 'cat.Tools': 'Araçlar',
  'cat.Music': 'Müzik', 'cat.Gaming': 'Oyun', 'cat.Health & Fitness': 'Sağlık & Fitness', 'cat.Shopping': 'Alışveriş',
  // status
  'status.Active': 'Aktif', 'status.Trial': 'Deneme', 'status.Expiring': 'Doluyor', 'status.Inactive': 'Pasif',
  // cycle
  'cycle.Monthly': 'Aylık', 'cycle.Yearly': 'Yıllık',
  // home
  'home.alertOver': '{cat} bu ay bütçeyi {over} aştı.', 'home.clearAll': 'Temizle',
  'home.totalMonthly': 'Toplam Aylık Harcama', 'home.activeSubs': 'Aktif Abonelik', 'home.projectedAnnual': 'Tahmini Yıllık',
  'home.aiInsight': 'Yapay Zekâ Önerisi', 'home.aiInsightBody': 'Ayda {amount} tasarruf et — çakışan müzik servislerin var ({names}).',
  'home.reviewDetails': 'Detayları Gör', 'home.exploreTitle': 'Abonelikleri Keşfet', 'home.activeSubsTitle': 'Aktif Abonelikler',
  'home.noneInCategory': 'Bu kategoride abonelik yok.',
  'home.emptyTitle': 'Henüz abonelik yok', 'home.emptyBody': 'Harcamanı, yenilemeleri ve tasarrufu takip etmek için aboneliklerini ekle.', 'home.addFirst': 'İlk aboneliğini ekle',
  'home.clearTitle': 'Tüm uyarılar temizlensin mi?',
  'home.clearBody': "Panodaki tüm 'İşlem Gerekli' bildirimleri kaldırılacak. Bu işlem geri alınamaz.",
  // chips
  'chip.All': 'Tümü',
  // subs
  'subs.title': 'Abonelikler', 'subs.activeServices': '{n} Aktif Servis', 'subs.totalMo': 'Toplam / Ay',
  'subs.searchPlaceholder': 'Abonelik ara...', 'subs.paid': 'Ödenen', 'subs.pending': 'Bekleyen',
  'subs.sortDate': 'Sonraki tarih', 'subs.sortPrice': 'Fiyat', 'subs.sortName': 'İsim', 'subs.none': 'Abonelik bulunamadı.',
  'subs.removeTitle': 'Abonelik kaldırılsın mı?',
  'subs.removeBody': '{name} SubSense panonuzdan kalıcı olarak kaldırılacak. Bu işlem geri alınamaz.',
  // explore
  'explore.title': 'Abonelikleri Keşfet', 'explore.subtitle': 'Dijital hayatınıza özel yeni servisleri keşfedin.',
  'explore.find': 'Servis ara…', 'explore.featured': 'Öne Çıkan', 'explore.none': '"{q}" için servis bulunamadı',
  'chip.Streaming': 'Yayın', 'chip.Design': 'Tasarım', 'chip.AI': 'Yapay Zekâ', 'chip.SaaS': 'SaaS',
  'chip.Learning': 'Öğrenme', 'chip.Turkish': 'Türkçe',
  // service profile
  'svc.notFound': 'Servis bulunamadı.', 'svc.startingAt': 'Başlangıç', 'svc.free': 'Ücretsiz',
  'svc.visitWebsite': 'Web Sitesi', 'svc.addToSubs': 'Aboneliklerime ekle', 'svc.est': 'Kuruluş',
  'svc.ceo': 'CEO', 'svc.founders': 'Kurucular', 'svc.globalUsers': 'Küresel Kullanıcı', 'svc.valuation': 'Değerleme',
  'svc.unitedStates': 'Amerika', 'svc.turkiye': 'Türkiye', 'svc.noRegion': 'Bölgesel fiyat bilgisi yok.',
  'svc.milestones': 'Önemli Kilometre Taşları',
  // add / edit
  'add.addSub': 'Abonelik Ekle', 'add.editSub': 'Aboneliği Düzenle', 'add.catalog': 'Katalog', 'add.custom': 'Özel',
  'add.searchPlaceholder': 'Abonelik ara...', 'add.results': 'Sonuçlar', 'add.popular': 'Popüler Servisler',
  'add.categories': 'Kategoriler', 'add.browseTitle': 'Tüm kataloğu gözat', 'add.browseSub': '40+ servisi tüm detaylarıyla keşfet',
  'add.allServices': 'Tüm servisler', 'add.choosePlan': 'Bir plan seç',
  'add.fieldName': 'Servis Adı', 'add.fieldPlan': 'Plan / Takma Ad', 'add.fieldPrice': 'Fiyat',
  'add.fieldCurrency': 'Para Birimi', 'add.fieldCycle': 'Faturalandırma', 'add.fieldStatus': 'Durum',
  'add.fieldNext': 'Sonraki Ödeme', 'add.fieldCategory': 'Kategori', 'add.fieldPayment': 'Ödeme Yöntemi',
  'add.fieldNotes': 'Notlar', 'add.notesPlaceholder': 'Hatırlamak istediğin bir şey...', 'add.reminder': 'Yenileme hatırlatıcısı',
  'add.errName': 'Lütfen bir servis adı gir.', 'add.errPrice': '0\'dan büyük bir fiyat gir.',
  'add.errPriceMax': 'Bu fiyat çok yüksek görünüyor.', 'add.errDate': 'Geçerli bir tarih seç.',
  // detail
  'detail.notFound': 'Abonelik bulunamadı.', 'detail.nextCharge': 'Sonraki Ödeme', 'detail.status': 'Durum',
  'detail.paymentMethod': 'Ödeme Yöntemi', 'detail.notSet': 'Ayarlanmadı', 'detail.priceHistory': 'Fiyat Geçmişi (12 ay)',
  'detail.notes': 'Notlar', 'detail.editSub': 'Aboneliği Düzenle', 'detail.markPaid': 'Ödendi Olarak İşaretle',
  'detail.deleteSub': 'Aboneliği Sil', 'detail.deleteTitle': 'Abonelik silinsin mi?',
  'detail.deleteBody': '{name} SubSense panonuzdan kalıcı olarak kaldırılacak. Bu işlem geri alınamaz.',
  // insights
  'ins.title': 'Analiz', 'ins.thisMonth': 'Bu Ay', 'ins.thisYear': 'Bu Yıl', 'ins.totalSpend': 'Toplam Harcama',
  'ins.savingsGoal': 'Tasarruf Hedefi', 'ins.saved': 'Biriken', 'ins.savingsBody': 'Yeni iPad hedefine %75 ulaştın.',
  'ins.categories': 'Kategoriler', 'ins.intelligence': 'Akıllı Öneriler',
  'ins.compareBody': 'Spotify Premium için dünya ortalamasından {pct} ödüyorsun.', 'ins.compareLess': '%12 daha az',
  'ins.redundant': 'Gereksiz Servisler Tespit Edildi',
  'ins.overlapBody': '{names} çakışıyor — birini tutup ayda {amount} tasarruf et.',
  'ins.noData': 'Analizleri görmek için abonelik ekle.',
  'ins.exportReport': 'Raporu Dışa Aktar',
  'ins.forecast': '12 Aylık Tahmin', 'ins.forecastBody': 'Tahmini harcama — uzun çubuklar yıllık planın yenilendiği aylar.',
  // profile
  'prof.premiumMember': 'Premium Üye', 'prof.activeSubs': 'Aktif Abonelik', 'prof.monthlySpend': 'Aylık Harcama',
  'prof.freePlan': 'Ücretsiz plan', 'prof.achievements': 'Başarımlar', 'prof.settings': 'Ayarlar',
  'prof.settingsSub': 'Tercihler & hesap', 'prof.refer': 'Arkadaşını Davet Et', 'prof.referSub': 'Bir ay ücretsiz Pro kazan',
  'prof.community': 'Topluluğa Katıl', 'prof.communitySub': 'İpuçları ve püf noktaları paylaş',
  // achievements
  'ach.first-step.t': 'İlk Adım', 'ach.first-step.d': 'İlk abonelik eklendi',
  'ach.power-user.t': 'Güçlü Kullanıcı', 'ach.power-user.d': '10+ aktif abonelik',
  'ach.savvy-saver.t': 'Akıllı Tasarrufçu', 'ach.savvy-saver.d': '100$ tasarruf',
  'ach.long-term.t': 'Uzun Vadeli Düşünen', 'ach.long-term.d': '1 yıl kesintisiz',
  'ach.streamer.t': 'Yayın Tutkunu', 'ach.streamer.d': '5 video aboneliği',
  // settings
  'set.title': 'Ayarlar', 'set.preferences': 'Tercihler', 'set.baseCurrency': 'Ana Para Birimi',
  'set.appLanguage': 'Uygulama Dili', 'set.appearance': 'Görünüm', 'set.appearanceDark': 'Koyu',
  'set.appearanceLight': 'Açık', 'set.appearanceSystem': 'Sistem', 'set.accountAlerts': 'Hesap & Uyarılar',
  'set.notifications': 'Bildirimler', 'set.renewalAlerts': 'Yenileme Uyarıları', 'set.pro': 'SubSense Pro',
  'set.appLock': 'Uygulama Kilidi', 'set.appLockDesc': 'Biyometrik kilit iste',
  'lock.title': 'SubSense Kilitli', 'lock.subtitle': 'Aboneliklerini görmek için kilidi aç', 'lock.unlock': 'Kilidi Aç', 'lock.reason': 'SubSense kilidini aç',
  'set.more': 'Daha Fazla', 'set.privacy': 'Gizlilik Politikası', 'set.help': 'Yardım & Destek',
  'set.loadSample': 'Örnek Veri Yükle', 'set.clearData': 'Tüm Veriyi Sil',
  'set.clearTitle': 'Tüm veri silinsin mi?', 'set.clearBody': 'Tüm aboneliklerin kalıcı olarak silinir ve uygulama sıfırlanır. Bu işlem geri alınamaz.',
  'set.signOut': 'Çıkış Yap',
  'set.data': 'Yedekleme & Veri',
  'set.exportBackup': 'Yedeği Dışa Aktar', 'set.importBackup': 'Yedekten Geri Yükle',
  'set.importTitle': 'Yedekten geri yüklensin mi?',
  'set.importBody': 'Mevcut aboneliklerin yedek dosyasındakilerle değiştirilir. Bu işlem geri alınamaz.',
  'set.importDone': '{count} abonelik geri yüklendi', 'set.importFail': 'Geçerli bir SubSense yedek dosyası değil.',
  'common.restore': 'Geri Yükle',
  // onboarding
  'onb.skip': 'Geç', 'onb.heroTitle': 'Aboneliklerinin kontrolünü ele al.',
  'onb.heroBody': 'Her yinelenen servisi — kendi para biriminle — neyi keseceğini tam söyleyen yapay zekâ ile takip et.',
  'onb.marquee': 'Netflix · Spotify · ChatGPT · Disney+ · Xbox · 40+ daha',
  'onb.f1t': 'Her aboneliği gör', 'onb.f1b': 'Her yinelenen ödemeyi tek bir düzenli yerde gösteririz.',
  'onb.f2t': 'Kendi para birimin', 'onb.f2b': 'Canlı kurlar toplamlarını her zaman doğru tutar.',
  'onb.f3t': 'Yapay zekâ neyi iptal edeceğini bulur', 'onb.f3b': 'Kullanılmayan servisleri ve gizli zamları yakala — tasarruf et.',
  'onb.getStarted': 'Başla', 'onb.haveAccount': 'Zaten bir hesabım var',
  'onb.rot1': 'Aboneliklerinin kontrolünü ele al.', 'onb.rot2': 'Hiçbir yenilemeyi kaçırma.', 'onb.rot3': 'Kullanmadığını kes.',
  'onb.privacy': 'Gizli · verilerin cihazında',
  // auth
  'auth.tagline': 'Aboneliklerini yönet.', 'auth.fullName': 'Ad Soyad', 'auth.baseCurrency': 'Ana Para Birimi',
  'auth.profileTitle': 'Profilini oluştur', 'auth.profileSubtitle': 'Hesap gerekmez — her şey bu cihazda kalır.',
  'auth.nameOptional': 'Ad Soyad (isteğe bağlı)', 'auth.namePlaceholder': 'Ayşe', 'auth.getStarted': 'Başla',
  'auth.google': 'Google ile devam et', 'auth.googleNote': 'Aboneliklerini cihazların arasında eşitle. İsteğe bağlı.',
  'auth.or': 'veya', 'auth.continueLocal': 'Hesapsız devam et',
  'auth.cloudNotReady': 'Bulut eşitleme bu sürümde henüz kurulmadı.', 'auth.googleFailed': 'Google girişi başarısız. Tekrar dene.',
  'set.account': 'Hesap', 'set.signInGoogle': 'Google ile giriş yap', 'set.syncDesc': 'Cihazların arasında yedekle ve eşitle',
  'set.syncedAs': 'Eşitlendi', 'set.signOutCloud': 'Çıkış yap',
  'set.deleteAccount': 'Hesabı sil', 'set.deleteAccountBusy': 'Siliniyor…',
  'set.deleteAccountTitle': 'Hesabın silinsin mi?',
  'set.deleteAccountBody': 'Bu işlem bulut hesabını ve buluta eşitlenen tüm verini kalıcı olarak siler. Geri alınamaz. Bu cihazda saklanan abonelikler korunur — onları kaldırmak için “Verileri Temizle”yi kullan.',
  'set.deleteAccountDone': 'Hesabın ve bulut verin silindi.',
  'set.deleteAccountFail': 'Hesabın silinemedi. Tekrar dene.',
  'set.deleteReauth': 'Lütfen tekrar giriş yap, sonra hesabı silmeyi dene.',
  // calendar
  'cal.title': 'Yenileme Takvimi', 'cal.weekly': 'Haftalık', 'cal.upcoming': 'Yaklaşan', 'cal.monthly': 'Aylık',
  'cal.estimated': 'Tahmini', 'cal.next7': 'Önümüzdeki 7 gün', 'cal.renewalsTitle': '{label} Yenilemeleri',
  'cal.noRenewals': 'Bu gün yenileme yok', 'cal.dueToday': 'Bugün', 'cal.autoRenew': 'Oto-yenileme',
  // compare
  'cmp.title': 'Bölgesel Fiyatlandırma', 'cmp.liveRates': 'Canlı Kur',
  'cmp.subtitle': 'Küresel abonelik maliyetlerini USD\'ye çevirerek karşılaştır.', 'cmp.individualPlan': 'Bireysel Plan',
  'cmp.insight': 'SubSense Önerisi',
  'cmp.insightBody': 'Bu servis Türkiye\'de {cheaper}. Fatura adresine uygunsa bölgesel ödeme yöntemlerini değerlendir.',
  'cmp.cheaper': '%82 daha ucuz', 'cmp.mapView': 'Harita Görünümü', 'cmp.yourRegion': 'Bölgen (ABD)',
  'cmp.cheapest': 'En Ucuz (HİN)', 'cmp.since': '2023\'ten beri +%15', 'cmp.priceHistory': 'Fiyat Geçmişi (USD Karşılığı)',
  'cmp.exploreRegions': 'Tüm Bölgeleri Keşfet',
  // ai chat
  // upgrade
  'up.pro': 'SubSense Pro', 'up.heroTitle': 'Paranı yönet', 'up.heroPro': 'Pro',
  'up.heroBody': 'Aboneliklerini optimize etmek için gelişmiş analizleri ve yapay zekâ önerilerini aç.',
  'up.f1t': 'Sınırsız Abonelik', 'up.f1b': 'Her şeyi sınır olmadan takip et.',
  'up.f2t': 'Yapay Zekâ Önerileri', 'up.f2b': 'Tasarruf için akıllı öneriler.',
  'up.f3t': 'Gelişmiş Analiz', 'up.f3b': 'Harcama alışkanlıklarına derinlemesine bak.',
  'up.monthly': 'Aylık', 'up.yearly': 'Yıllık', 'up.bestValue': 'En İyi Değer', 'up.save33': '%33 Tasarruf',
  'up.cta': 'Pro\'ya Yükselt', 'up.restore': 'Satın Alımları Geri Yükle',
  // subrow
  'row.next': 'Sonraki', 'row.expiring': 'Doluyor', 'row.actionRequired': 'İşlem Gerekli',
  // notifications
  'notif.title': '{name} yakında yenileniyor', 'notif.body': '{amount} · {date} yenilenir',
  'notif.priceTitle': 'Fiyat artışı', 'notif.priceBody': '{name} artık {price}.',
  'ins.priceUp': 'Fiyat artışları', 'ins.priceUpBody': '{name}: {from} → {to}',
  'common.dismiss': 'Kapat',
  'widget.monthly': 'Aylık', 'widget.next': 'Sıradaki', 'widget.empty': 'Henüz abonelik yok',
};

const DICTS: Record<Lang, Dict> = { en: EN, tr: TR };

const MONTHS: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
};
const MONTHS_SHORT: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
};
// Day-of-week initials starting Sunday.
const DAYS: Record<Lang, string[]> = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  tr: ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
};

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export interface I18n {
  lang: Lang;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tCat: (c: Category | string) => string;
  tStatus: (s: SubStatus) => string;
  tCycle: (c: Cycle) => string;
  months: string[];
  monthsShort: string[];
  days: string[];
}

/** Non-hook translator for contexts without React (e.g. scheduling notifications). */
export function tStatic(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const safe: Lang = lang === 'tr' ? 'tr' : 'en';
  return interpolate(DICTS[safe][key] ?? EN[key] ?? key, vars);
}

/** Translation hook — reactive to the language setting. */
export function useT(): I18n {
  const lang = useApp((s) => s.settings.language) as Lang;
  const safe: Lang = lang === 'tr' ? 'tr' : 'en';
  const dict = DICTS[safe];
  const t = (key: string, vars?: Record<string, string | number>) =>
    interpolate(dict[key] ?? EN[key] ?? key, vars);
  return {
    lang: safe,
    t,
    tCat: (c) => t(`cat.${c}`),
    tStatus: (s) => t(`status.${s}`),
    tCycle: (c) => t(`cycle.${c}`),
    months: MONTHS[safe],
    monthsShort: MONTHS_SHORT[safe],
    days: DAYS[safe],
  };
}
