import { useT } from '../core/lib/i18n';

// UI copy for the web + desktop app. Category, status, cycle and
// notification strings come from the shared core dictionary (core/lib/i18n.ts).
const en = {
  'nav.overview': 'Overview', 'nav.subs': 'Subscriptions', 'nav.calendar': 'Calendar', 'nav.insights': 'Insights',
  'nav.discover': 'Discover', 'nav.settings': 'Settings',
  'top.signIn': 'Sign in', 'top.search': 'Search', 'top.theme': 'Switch theme', 'top.lang': 'Türkçe',
  'sync.synced': 'Synced', 'sync.working': 'Syncing', 'sync.offline': 'Offline', 'sync.error': 'Sync paused', 'sync.local': 'On this device',

  'land.title': 'Every subscription, one quiet place.',
  'land.lede': 'SubSense shows what you pay, when it renews and where prices went up. Free for good: no ads, no paywall, no bank login.',
  'land.start': 'Create free account', 'land.try': 'Try without an account',
  'land.specimen': 'A sample month. Each dot renews on its day; bigger dots cost more.',
  'land.why': 'What it does for you',
  'land.w1': 'See the month at a glance', 'land.w1t': 'Every renewal on one dial, totals in your own currency, budgets per category.',
  'land.w2': 'Catch price hikes', 'land.w2t': 'Prices for Turkey and the US are kept current. When a service raises its price, you see it.',
  'land.w3': 'Get reminded in time', 'land.w3t': 'A heads-up before each renewal, so a forgotten trial never turns into a charge.',
  'land.w4': 'Same account everywhere', 'land.w4t': 'Web, Mac and Android share one account and stay in sync. Works offline too.',
  'land.free': 'Free, without an asterisk',
  'land.freeText': 'There is no premium tier to unlock later. Your data is yours: export it any time, delete it with one click.',
  'land.catalog': 'Prices we track',
  'land.catalogMore': 'See all prices',

  'ov.kicker': '{month}: {n} renewals',
  'ov.kickerEmpty': 'Nothing tracked yet',
  'ov.perMonth': 'per month', 'ov.dueMonth': 'due this month', 'ov.avg': 'Monthly average.', 'ov.emptyHint': 'Add your first one', 'ov.title': 'Your subscriptions, right now', 'ov.sentence': 'You pay {month} a month and {year} a year across {n} active subscriptions.', 'ov.metaSubs': '{n} subscriptions', 'ov.count': '{n} subscriptions',
  'ov.next': 'Next up: {name}, {when}.',
  'ov.noneSoon': 'No renewals in the next 30 days.',
  'ov.yearly': 'About {amount} a year.',
  'ov.add': 'Add subscription', 'ov.calendar': 'Open calendar',
  'ov.emptyTitle': 'Your month is empty',
  'ov.emptyText': 'Add the services you pay for. Start from a known service and SubSense fills in the current price.',
  'ov.sample': 'Load sample data',
  'ov.upcoming': 'Coming up', 'ov.categories': 'Where it goes', 'ov.alerts': 'Worth a look',
  'ov.overBudget': '{cat} is over budget: {spent} of {limit}.',
  'ov.overlap': 'You pay for {count} {cat} services. Keeping only the cheapest saves {amount} a month.',
  'ov.trialEnds': '{name} trial ends {when}. It then costs {amount}.',
  'ov.priceUp': '{name} now lists at {price}.',
  'ov.dismiss': 'Dismiss',
  'ov.specimen': 'This month. Today is the hand; tap a dot to open it.',
  'ov.verify': 'Confirm your email to keep your account safe.', 'ov.resend': 'Resend email', 'ov.sent': 'Sent',

  'subs.title': 'Subscriptions', 'subs.lede': '{n} tracked, {active} active.',
  'subs.search': 'Search by name, plan or note', 'subs.all': 'All',
  'subs.none': 'No subscriptions match. Try a shorter word or another filter.',
  'subs.empty': 'Nothing here yet. Add your first subscription.',
  'subs.shared': 'shared', 'subs.inDays': 'in {n} d', 'subs.today': 'today', 'subs.overdue': 'overdue',

  'ed.add': 'Add subscription', 'ed.edit': 'Edit subscription',
  'ed.find': 'Find a service', 'ed.findPh': 'Netflix, Spotify, Exxen…', 'ed.custom': 'Add "{q}" as a custom service',
  'ed.name': 'Name', 'ed.plan': 'Plan', 'ed.price': 'Price', 'ed.currency': 'Currency', 'ed.cycle': 'Billing',
  'ed.next': 'Next payment', 'ed.category': 'Category', 'ed.status': 'Status', 'ed.trialEnd': 'Trial ends',
  'ed.shared': 'I share this plan', 'ed.myShare': 'My share', 'ed.notes': 'Notes', 'ed.remind': 'Remind me before it renews',
  'ed.payment': 'Payment method', 'ed.paymentPh': 'Card, PayPal…',
  'ed.save': 'Save', 'ed.addShort': 'Add', 'ed.create': 'Add subscription', 'ed.cancel': 'Cancel', 'ed.delete': 'Delete', 'ed.paid': 'Mark as paid',
  'ed.deleteConfirm': 'Delete {name}? This removes it on every device.', 'ed.deleteYes': 'Delete subscription',
  'ed.errName': 'Enter a name.', 'ed.errPrice': 'Enter a price of 0 or more.', 'ed.errDate': 'Pick the next payment date.',
  'ed.planPick': 'Current prices', 'ed.history': 'Price history',

  'cal.title': 'Calendar', 'cal.lede': '{amount} renews in {month}.', 'cal.today': 'Today',
  'cal.prev': 'Previous month', 'cal.next': 'Next month', 'cal.empty': 'No renewals this day.',

  'in.title': 'Insights', 'in.lede': 'You spend {month} a month, {year} a year.',
  'in.byCat': 'By category', 'in.forecast': 'Next 12 months', 'in.top': 'Most expensive', 'in.budgets': 'Budgets',
  'in.budgetHint': 'Set a monthly limit per category. SubSense warns you when you pass it.', 'in.noLimit': 'No limit',
  'in.empty': 'Add subscriptions to see where your money goes.',
  'nav.wrapped': 'Year in review',
  'wr.title': 'Your {year} in subscriptions', 'wr.lede': 'What your current subscriptions add up to over a full year.',
  'wr.perDay': 'Per day', 'wr.perDayText': 'That is {week} every week.',
  'wr.count': 'Active subscriptions', 'wr.countText': 'Together they cost {month} a month.',
  'wr.topCat': 'Biggest category', 'wr.topCatText': '{pct}% of your spending, {amount} a year.',
  'wr.priciest': 'Most expensive', 'wr.priciestText': '{amount} a year on its own.',
  'wr.peak': 'Heaviest month', 'wr.peakText': '{amount} is due that month.',
  'wr.oldest': 'With you the longest', 'wr.oldestText': 'A subscriber since {year}.',
  'wr.note': 'Calculated from your current list and prices. Past price changes and cancelled subscriptions are not included.',

  'dis.title': 'Discover', 'dis.lede': 'Current prices for {n} services in Turkey and the US.',
  'dis.search': 'Search services', 'dis.from': 'from {price}', 'dis.region': 'Region', 'dis.tr': 'Turkey', 'dis.us': 'United States',
  'dis.add': 'Track this', 'dis.site': 'Website', 'dis.tiers': 'Plans', 'dis.none': 'No service matches.',


  'set.title': 'Settings',
  'set.account': 'Account', 'set.signedAs': 'Signed in as {email}', 'set.local': 'Not signed in. Your data stays on this device.',
  'set.signIn': 'Sign in to sync', 'set.signOut': 'Sign out', 'set.linkGoogle': 'Link Google', 'set.linked': 'Linked: {list}',
  'set.delete': 'Delete account', 'set.deleteText': 'Deletes your account and every synced subscription. This cannot be undone.',
  'set.deletePw': 'Enter your password to confirm', 'set.deleteYes': 'Delete my account',
  'set.look': 'Appearance', 'set.theme': 'Theme', 'set.light': 'Light', 'set.dark': 'Dark', 'set.system': 'System',
  'set.language': 'Language', 'set.currency': 'Main currency',
  'set.notify': 'Notifications', 'set.notifyOn': 'Notify me about renewals and price changes',
  'set.data': 'Your data', 'set.export': 'Export JSON', 'set.exportCsv': 'Export CSV', 'set.import': 'Import JSON',
  'set.imported': 'Imported {n} subscriptions.', 'set.importBad': 'This file is not a SubSense backup.',
  'set.sample': 'Load sample data', 'set.clear': 'Clear this device', 'set.clearText': 'Removes all subscriptions stored in this browser.',
  'set.clearSigned': 'Sign out first to clear this device. Signed-in data lives in your account.',
  'set.about': 'About', 'set.version': 'Version {v}', 'set.versionLabel': 'Version', 'set.privacy': 'Privacy', 'set.deletion': 'Account deletion',

  'auth.title': 'Sign in to SubSense', 'auth.titleUp': 'Create your account',
  'auth.lede': 'One account for web, Mac and Android. Free, always.',
  'auth.google': 'Continue with Google', 'auth.apple': 'Continue with Apple', 'auth.or': 'or',
  'auth.name': 'Name', 'auth.email': 'Email', 'auth.password': 'Password',
  'auth.signIn': 'Sign in', 'auth.signUp': 'Create account', 'auth.toUp': 'New here? Create an account', 'auth.toIn': 'Have an account? Sign in',
  'auth.forgot': 'Forgot password?', 'auth.resetSent': 'Check your inbox for a reset link.',
  'auth.guest': 'Continue without an account',
  'err.auth/invalid-credential': 'Email or password is wrong.',
  'err.auth/email-already-in-use': 'An account with this email exists. Sign in instead.',
  'err.auth/weak-password': 'Use at least 6 characters.',
  'err.auth/invalid-email': 'This email address looks wrong.',
  'err.auth/popup-closed-by-user': 'The Google window was closed before signing in.',
  'err.auth/account-exists-with-different-credential': 'This email signs in with a password. Sign in that way, then link Google in Settings.',
  'err.auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'err.auth/network-request-failed': 'No connection. Check your internet and try again.',
  'err.password-required': 'Enter your password to continue.',
  'err.generic': 'Something went wrong ({code}). Try again.',

  'pal.ph': 'Search subscriptions, services or pages…', 'pal.pages': 'Pages', 'pal.subs': 'Your subscriptions', 'pal.services': 'Services', 'pal.none': 'No match. Try a shorter word.',
  'foot.tagline': 'A free subscription tracker. No ads, no paywall.',
  'foot.android': 'Get it on Android', 'foot.privacy': 'Privacy', 'foot.deletion': 'Delete account', 'foot.source': 'Made by Kutluhan Gül',
  'legal.privacy': 'Privacy', 'legal.deletion': 'Account deletion',
}

type Key = keyof typeof en

const tr: Record<Key, string> = {
  'nav.overview': 'Genel bakış', 'nav.subs': 'Abonelikler', 'nav.calendar': 'Takvim', 'nav.insights': 'İçgörüler',
  'nav.discover': 'Keşfet', 'nav.settings': 'Ayarlar',
  'top.signIn': 'Giriş yap', 'top.search': 'Ara', 'top.theme': 'Temayı değiştir', 'top.lang': 'English',
  'sync.synced': 'Senkron', 'sync.working': 'Eşitleniyor', 'sync.offline': 'Çevrimdışı', 'sync.error': 'Senkron durdu', 'sync.local': 'Bu cihazda',

  'land.title': 'Tüm abonelikler, tek sakin yerde.',
  'land.lede': 'SubSense ne ödediğini, ne zaman yenilendiğini ve hangi fiyatın arttığını gösterir. Hep ücretsiz: reklam yok, ücretli sürüm yok, banka girişi yok.',
  'land.start': 'Ücretsiz hesap aç', 'land.try': 'Hesapsız dene',
  'land.specimen': 'Örnek bir ay. Her nokta kendi gününde yenilenir; büyük nokta daha pahalı.',
  'land.why': 'Senin için ne yapar',
  'land.w1': 'Ayı tek bakışta gör', 'land.w1t': 'Her yenileme tek kadranda, toplamlar kendi para biriminde, kategori başına bütçe.',
  'land.w2': 'Zamları yakala', 'land.w2t': 'Türkiye ve ABD fiyatları güncel tutulur. Bir servis zam yaptığında görürsün.',
  'land.w3': 'Zamanında haber al', 'land.w3t': 'Her yenilemeden önce hatırlatma; unutulan deneme süresi faturaya dönüşmez.',
  'land.w4': 'Her yerde aynı hesap', 'land.w4t': 'Web, Mac ve Android tek hesapla eşitlenir. İnternet yokken de çalışır.',
  'land.free': 'Ücretsiz, yıldız işareti yok',
  'land.freeText': 'Sonradan açılacak bir premium yok. Verin senin: istediğin an dışa aktar, tek tıkla sil.',
  'land.catalog': 'Takip ettiğimiz fiyatlar',
  'land.catalogMore': 'Tüm fiyatları gör',

  'ov.kicker': '{month}: {n} yenileme',
  'ov.kickerEmpty': 'Henüz takip edilen yok',
  'ov.perMonth': 'aylık', 'ov.dueMonth': 'bu ay ödenecek', 'ov.avg': 'Aylık ortalama.', 'ov.emptyHint': 'İlkini ekle', 'ov.title': 'Aboneliklerin şu an', 'ov.sentence': 'Ayda {month}, yılda {year} ödüyorsun; {n} aktif aboneliğin var.', 'ov.metaSubs': '{n} abonelik', 'ov.count': '{n} abonelik',
  'ov.next': 'Sıradaki: {name}, {when}.',
  'ov.noneSoon': 'Önümüzdeki 30 günde yenileme yok.',
  'ov.yearly': 'Yılda yaklaşık {amount}.',
  'ov.add': 'Abonelik ekle', 'ov.calendar': 'Takvimi aç',
  'ov.emptyTitle': 'Bu ay boş',
  'ov.emptyText': 'Ödediğin servisleri ekle. Bilinen bir servisten başlarsan SubSense güncel fiyatı kendisi doldurur.',
  'ov.sample': 'Örnek veri yükle',
  'ov.upcoming': 'Yaklaşanlar', 'ov.categories': 'Para nereye gidiyor', 'ov.alerts': 'Göz atmaya değer',
  'ov.overBudget': '{cat} bütçeyi aştı: {limit} limitin {spent} oldu.',
  'ov.overlap': '{count} ayrı {cat} servisine ödüyorsun. Yalnız en ucuzunu tutmak ayda {amount} kazandırır.',
  'ov.trialEnds': '{name} deneme süresi {when} bitiyor. Sonra {amount} tutacak.',
  'ov.priceUp': '{name} artık {price}.',
  'ov.dismiss': 'Kapat',
  'ov.specimen': 'Bu ay. İbre bugünü gösterir; açmak için bir noktaya dokun.',
  'ov.verify': 'Hesabını korumak için e-postanı doğrula.', 'ov.resend': 'E-postayı yeniden gönder', 'ov.sent': 'Gönderildi',

  'subs.title': 'Abonelikler', 'subs.lede': '{n} takipte, {active} aktif.',
  'subs.search': 'Ad, plan ya da not ile ara', 'subs.all': 'Tümü',
  'subs.none': 'Eşleşen abonelik yok. Daha kısa bir kelime ya da başka filtre dene.',
  'subs.empty': 'Burada henüz bir şey yok. İlk aboneliğini ekle.',
  'subs.shared': 'ortak', 'subs.inDays': '{n} gün', 'subs.today': 'bugün', 'subs.overdue': 'gecikti',

  'ed.add': 'Abonelik ekle', 'ed.edit': 'Aboneliği düzenle',
  'ed.find': 'Servis bul', 'ed.findPh': 'Netflix, Spotify, Exxen…', 'ed.custom': '"{q}" özel servis olarak ekle',
  'ed.name': 'Ad', 'ed.plan': 'Plan', 'ed.price': 'Fiyat', 'ed.currency': 'Para birimi', 'ed.cycle': 'Ödeme',
  'ed.next': 'Sonraki ödeme', 'ed.category': 'Kategori', 'ed.status': 'Durum', 'ed.trialEnd': 'Deneme bitişi',
  'ed.shared': 'Bu planı paylaşıyorum', 'ed.myShare': 'Benim payım', 'ed.notes': 'Notlar', 'ed.remind': 'Yenilenmeden önce hatırlat',
  'ed.payment': 'Ödeme yöntemi', 'ed.paymentPh': 'Kart, PayPal…',
  'ed.save': 'Kaydet', 'ed.addShort': 'Ekle', 'ed.create': 'Abonelik ekle', 'ed.cancel': 'Vazgeç', 'ed.delete': 'Sil', 'ed.paid': 'Ödendi olarak işaretle',
  'ed.deleteConfirm': '{name} silinsin mi? Tüm cihazlardan kaldırılır.', 'ed.deleteYes': 'Aboneliği sil',
  'ed.errName': 'Bir ad gir.', 'ed.errPrice': '0 ya da daha büyük bir fiyat gir.', 'ed.errDate': 'Sonraki ödeme tarihini seç.',
  'ed.planPick': 'Güncel fiyatlar', 'ed.history': 'Fiyat geçmişi',

  'cal.title': 'Takvim', 'cal.lede': '{month} ayında {amount} yenileniyor.', 'cal.today': 'Bugün',
  'cal.prev': 'Önceki ay', 'cal.next': 'Sonraki ay', 'cal.empty': 'Bu gün yenileme yok.',

  'in.title': 'İçgörüler', 'in.lede': 'Ayda {month}, yılda {year} harcıyorsun.',
  'in.byCat': 'Kategoriye göre', 'in.forecast': 'Önümüzdeki 12 ay', 'in.top': 'En pahalılar', 'in.budgets': 'Bütçeler',
  'in.budgetHint': 'Her kategori için aylık limit koy. Aşınca SubSense uyarır.', 'in.noLimit': 'Limit yok',
  'in.empty': 'Paranın nereye gittiğini görmek için abonelik ekle.',
  'nav.wrapped': 'Yıllık özet',
  'wr.title': '{year} abonelik özetin', 'wr.lede': 'Şu anki aboneliklerinin bir yılda tuttuğu toplam.',
  'wr.perDay': 'Günde', 'wr.perDayText': 'Haftada {week} ediyor.',
  'wr.count': 'Aktif abonelik', 'wr.countText': 'Hepsi birlikte ayda {month} tutuyor.',
  'wr.topCat': 'En büyük kategori', 'wr.topCatText': 'Harcamanın %{pct} kadarı, yılda {amount}.',
  'wr.priciest': 'En pahalısı', 'wr.priciestText': 'Tek başına yılda {amount}.',
  'wr.peak': 'En yüklü ay', 'wr.peakText': 'O ay {amount} ödenecek.',
  'wr.oldest': 'En eski aboneliğin', 'wr.oldestText': '{year} yılından beri abonesin.',
  'wr.note': 'Şu anki listene ve fiyatlara göre hesaplanır. Geçmiş fiyat değişiklikleri ve iptal ettiğin abonelikler dahil değildir.',

  'dis.title': 'Keşfet', 'dis.lede': '{n} servisin Türkiye ve ABD güncel fiyatları.',
  'dis.search': 'Servis ara', 'dis.from': '{price} başlayan', 'dis.region': 'Bölge', 'dis.tr': 'Türkiye', 'dis.us': 'ABD',
  'dis.add': 'Takibe al', 'dis.site': 'Web sitesi', 'dis.tiers': 'Planlar', 'dis.none': 'Eşleşen servis yok.',


  'set.title': 'Ayarlar',
  'set.account': 'Hesap', 'set.signedAs': '{email} ile giriş yapıldı', 'set.local': 'Giriş yapılmadı. Verilerin bu cihazda kalır.',
  'set.signIn': 'Senkron için giriş yap', 'set.signOut': 'Çıkış yap', 'set.linkGoogle': 'Google bağla', 'set.linked': 'Bağlı: {list}',
  'set.delete': 'Hesabı sil', 'set.deleteText': 'Hesabını ve eşitlenen tüm abonelikleri siler. Geri alınamaz.',
  'set.deletePw': 'Onaylamak için şifreni gir', 'set.deleteYes': 'Hesabımı sil',
  'set.look': 'Görünüm', 'set.theme': 'Tema', 'set.light': 'Açık', 'set.dark': 'Koyu', 'set.system': 'Sistem',
  'set.language': 'Dil', 'set.currency': 'Ana para birimi',
  'set.notify': 'Bildirimler', 'set.notifyOn': 'Yenilemeler ve fiyat değişimleri için bildir',
  'set.data': 'Verilerin', 'set.export': 'JSON dışa aktar', 'set.exportCsv': 'CSV dışa aktar', 'set.import': 'JSON içe aktar',
  'set.imported': '{n} abonelik içe aktarıldı.', 'set.importBad': 'Bu dosya bir SubSense yedeği değil.',
  'set.sample': 'Örnek veri yükle', 'set.clear': 'Bu cihazı temizle', 'set.clearText': 'Bu tarayıcıda kayıtlı tüm abonelikleri kaldırır.',
  'set.clearSigned': 'Bu cihazı temizlemek için önce çıkış yap. Girişliyken veriler hesabında durur.',
  'set.about': 'Hakkında', 'set.version': 'Sürüm {v}', 'set.versionLabel': 'Sürüm', 'set.privacy': 'Gizlilik', 'set.deletion': 'Hesap silme',

  'auth.title': "SubSense'e giriş yap", 'auth.titleUp': 'Hesabını oluştur',
  'auth.lede': 'Web, Mac ve Android için tek hesap. Her zaman ücretsiz.',
  'auth.google': 'Google ile devam et', 'auth.apple': 'Apple ile devam et', 'auth.or': 'ya da',
  'auth.name': 'Ad', 'auth.email': 'E-posta', 'auth.password': 'Şifre',
  'auth.signIn': 'Giriş yap', 'auth.signUp': 'Hesap oluştur', 'auth.toUp': 'Yeni misin? Hesap oluştur', 'auth.toIn': 'Hesabın var mı? Giriş yap',
  'auth.forgot': 'Şifreni mi unuttun?', 'auth.resetSent': 'Sıfırlama bağlantısı için gelen kutuna bak.',
  'auth.guest': 'Hesapsız devam et',
  'err.auth/invalid-credential': 'E-posta ya da şifre yanlış.',
  'err.auth/email-already-in-use': 'Bu e-postayla bir hesap var. Giriş yap.',
  'err.auth/weak-password': 'En az 6 karakter kullan.',
  'err.auth/invalid-email': 'Bu e-posta adresi hatalı görünüyor.',
  'err.auth/popup-closed-by-user': 'Google penceresi giriş yapılmadan kapandı.',
  'err.auth/account-exists-with-different-credential': 'Bu e-posta şifreyle giriş yapıyor. Öyle giriş yap, sonra Ayarlar\'dan Google\'ı bağla.',
  'err.auth/too-many-requests': 'Çok fazla deneme. Bir dakika bekleyip tekrar dene.',
  'err.auth/network-request-failed': 'Bağlantı yok. İnternetini kontrol edip tekrar dene.',
  'err.password-required': 'Devam etmek için şifreni gir.',
  'err.generic': 'Bir şey ters gitti ({code}). Tekrar dene.',

  'pal.ph': 'Abonelik, servis ya da sayfa ara…', 'pal.pages': 'Sayfalar', 'pal.subs': 'Aboneliklerin', 'pal.services': 'Servisler', 'pal.none': 'Eşleşme yok. Daha kısa bir kelime dene.',
  'foot.tagline': 'Ücretsiz abonelik takipçisi. Reklam yok, ücretli sürüm yok.',
  'foot.android': "Android'de indir", 'foot.privacy': 'Gizlilik', 'foot.deletion': 'Hesap silme', 'foot.source': 'Kutluhan Gül yaptı',
  'legal.privacy': 'Gizlilik', 'legal.deletion': 'Hesap silme',
}

const DICT = { en, tr }

function fill(s: string, vars?: Record<string, string | number>) {
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`)) : s
}

/** UI translator: our keys first, then the shared core dictionary. */
export function useI() {
  const core = useT()
  const dict = DICT[core.lang]
  const t = (key: string, vars?: Record<string, string | number>) =>
    key in dict ? fill(dict[key as Key], vars) : core.t(key, vars)
  const err = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? (e instanceof Error ? e.message : 'unknown')
    const k = `err.${code}`
    return k in dict ? dict[k as Key] : fill(dict['err.generic'], { code })
  }
  return { ...core, t, err }
}
