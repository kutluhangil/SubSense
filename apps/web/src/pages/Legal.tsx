import { useI } from '../ui/strings'
import { PageHead } from '../ui/kit'

type Doc = { title: string; updated: string; blocks: [string, string][] }

const PRIVACY: Record<'tr' | 'en', Doc> = {
  tr: {
    title: 'Gizlilik', updated: 'Son güncelleme: 10 Kasım 2026',
    blocks: [
      ['Kısaca', 'SubSense ücretsizdir ve reklam göstermez. Verini satmaz, reklam için kullanmaz, kimseyle paylaşmaz.'],
      ['Hesapsız kullanım', 'Hesap açmadan kullanırsan abonelik listen yalnız bu cihazda (tarayıcı depolaması) durur; bize hiçbir şey gelmez.'],
      ['Hesapla kullanım', 'Giriş yaparsan e-posta adresin, adın ve abonelik kayıtların (servis adı, plan, fiyat, tarih, notlar) Google Firebase üzerinde, yalnız senin erişebileceğin şekilde saklanır. Amaç cihazlarını eşitlemektir.'],
      ['Üçüncü taraflar', 'Kimlik doğrulama ve veri saklama için Google Firebase; döviz kurları için open.er-api.com (kişisel veri gönderilmez). Analitik ya da reklam aracı yoktur.'],
      ['Haklarını kullanma', 'Verilerini istediğin an Ayarlar → Verilerin bölümünden dışa aktarabilir, Ayarlar → Hesap → Hesabı sil ile kalıcı olarak silebilirsin.'],
      ['İletişim', 'kutluhangil@gmail.com'],
    ],
  },
  en: {
    title: 'Privacy', updated: 'Last updated: November 10, 2026',
    blocks: [
      ['In short', 'SubSense is free and shows no ads. It does not sell your data, use it for advertising or share it with anyone.'],
      ['Without an account', 'If you use SubSense without an account, your subscriptions stay on this device (browser storage). Nothing reaches us.'],
      ['With an account', 'If you sign in, your email, name and subscription records (service, plan, price, dates, notes) are stored in Google Firebase, readable only by you, to keep your devices in sync.'],
      ['Third parties', 'Google Firebase for sign-in and storage; open.er-api.com for exchange rates (no personal data is sent). No analytics or ad tools.'],
      ['Your rights', 'Export your data any time under Settings → Your data, and delete it permanently under Settings → Account → Delete account.'],
      ['Contact', 'kutluhangil@gmail.com'],
    ],
  },
}

const DELETION: Record<'tr' | 'en', Doc> = {
  tr: {
    title: 'Hesap silme', updated: 'Web, Mac ve Android için geçerlidir.',
    blocks: [
      ['Uygulamadan', 'Ayarlar → Hesap → Hesabı sil. Şifreyle giriş yapıyorsan şifreni girip onaylarsın, Google ile giriş yapıyorsan Google tekrar sorar.'],
      ['Neler silinir', 'Hesabın, profilin ve eşitlenen tüm abonelik kayıtların hemen ve kalıcı olarak silinir. Geri alınamaz.'],
      ['Uygulamaya erişemiyorsan', 'Kayıtlı e-posta adresinden kutluhangil@gmail.com adresine "Hesabımı sil" konulu bir e-posta gönder. 30 gün içinde silinir ve sana bildirilir.'],
    ],
  },
  en: {
    title: 'Account deletion', updated: 'Applies to web, Mac and Android.',
    blocks: [
      ['In the app', 'Settings → Account → Delete account. Password accounts confirm with their password; Google accounts confirm with Google.'],
      ['What is deleted', 'Your account, profile and every synced subscription are deleted immediately and permanently. This cannot be undone.'],
      ['Cannot reach the app?', 'Email kutluhangil@gmail.com from your account address with the subject "Delete my account". It is deleted within 30 days and you get a confirmation.'],
    ],
  },
}

export function Legal({ kind }: { kind: 'privacy' | 'deletion' }) {
  const { lang } = useI()
  const doc = (kind === 'privacy' ? PRIVACY : DELETION)[lang]
  return (
    <div>
      <PageHead title={doc.title} lede={doc.updated} />
      <article className="mx-auto mt-12 max-w-[680px] space-y-3 px-4 sm:px-6">
        {doc.blocks.map(([h, p]) => (
          <section key={h} className="card p-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.016em] text-label">{h}</h2>
            <p className="mt-2 text-[17px] leading-[1.6] text-label-2">{p}</p>
          </section>
        ))}
      </article>
    </div>
  )
}
