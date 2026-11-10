// Turkish editorial overrides for the Explore catalog (description + milestones).
// Keyed by the English service name. Services missing here fall back to their
// authored text (Turkish-only services already store Turkish copy). See localizedExplore().

export interface ExploreTrEntry {
  description: string[];
  milestones: string[];
}

export const EXPLORE_TR: Record<string, ExploreTrEntry> = {
  // ── Entertainment & Streaming ──────────────────────────────────────────────
  'Netflix': {
    description: [
      "Netflix yolculuğuna 1997'de DVD'leri postayla kiralayan bir servis olarak başladı; fikir, Reed Hastings'in Apollo 13 kirasını geç iade ettiği için 40 dolar ceza ödemesinin ardından doğdu. Şirket 2007'de internet üzerinden yayına geçti ve bu hamle küresel eğlence sektörünü kökten değiştirerek geleneksel video kiralama dükkânlarının sonunu getirdi.",
      "Yıllar içinde Netflix bir içerik dağıtıcısından devasa bir içerik üreticisine dönüştü. 2013'te 'House of Cards' ile sezonun tamamını aynı anda yayınlayarak 'maraton izleme' modelinin öncüsü oldu. Bugün 190'dan fazla ülkede faaliyet gösteriyor ve onlarca dilde orijinal içerik üreterek dünyanın ilk küresel TV ağı hâline geldi.",
      "Artan rekabete rağmen Netflix, güçlü öneri algoritması ve 'Stranger Things', 'Squid Game' ve 'The Crown' gibi büyük kültürel hitleriyle yayın pazarının lideri olmayı sürdürüyor. İnteraktif hikâye anlatımı ve mobil oyunlar dâhil yeni formatları denemeye devam ediyor.",
    ],
    milestones: [
      "1997: DVD-posta servisi olarak kuruldu",
      "2007: İnternet yayın servisini başlattı",
      "2013: İlk orijinal dizisi 'House of Cards' yayınlandı",
      "2016: 130 yeni ülkeye aynı anda küresel açılım",
      "2021: Squid Game tüm zamanların en çok izlenen dizisi oldu",
      "2022: Reklamlı paketi başlattı",
      "2025: 280 milyon aboneyi aştı",
    ],
  },
  'Disney+': {
    description: [
      "Disney+ Kasım 2019'da yayına girdi; The Walt Disney Company'nin geleneksel sinema ve kablolu dağıtımdan doğrudan tüketiciye yayına geçtiği tarihî bir dönüm noktasıydı. İlk gününde 10 milyon aboneye ulaşarak sektör beklentilerini fazlasıyla aştı.",
      "Servis; Disney, Pixar, Marvel, Star Wars ve National Geographic markalarının film ve dizilerinin özel evi. Bu kütüphane, ilk canlı aksiyon Star Wars dizisi olan ve anında küresel bir fenomene dönüşen 'The Mandalorian' gibi kültürel devleri barındırıyor.",
      "Bugün Disney+ küresel yayının 'Üç Büyükleri'nden biri. ABD'de Hulu, uluslararası alanda Star içeriklerini entegre ederek aile dostu içeriklerinin yanında kapsamlı bir genel eğlence sunmayı hedefliyor.",
    ],
    milestones: [
      "2019: 'The Mandalorian' ile lansman",
      "2020: 5 ayda 50 milyon aboneye ulaştı",
      "2020: 'Hamilton' ve 'Soul' doğrudan yayında",
      "2022: Reklamlı paketi başlattı",
      "2024: Hulu içeriğini ana uygulamaya entegre etti",
    ],
  },
  'Prime Video': {
    description: [
      "Amazon Prime Video 2006'da, başlangıçta bir indirme servisi olan Amazon Unbox olarak başladı. O zamandan beri ücretsiz kargo ve müzik içeren Amazon Prime üyeliğiyle paketlenen büyük bir küresel yayın oyuncusuna dönüştü. Bu paketleme stratejisi onu dünyanın en erişilebilir yayın servislerinden biri yaptı.",
      "Amazon orijinal içeriğe büyük yatırım yaptı; 'The Marvelous Mrs. Maisel' gibi eleştirmen favorileri ve 'The Lord of the Rings: The Rings of Power' gibi yüksek bütçeli yapımlar üretti. Saf yayın servislerinin aksine Prime Video, Amazon ekosistemine değer katarak perakende sadakatini besliyor.",
      "Son yıllarda Prime Video, NFL Thursday Night Football'un özel yayın haklarını alarak canlı spora yöneldi. Ayrıca 'Channels' ile kullanıcıların HBO veya Starz gibi ağlara doğrudan Prime arayüzünden abone olmasına izin vererek yayın pazarında bir toplayıcı rolü üstleniyor.",
    ],
    milestones: [
      "2006: Amazon Unbox başlatıldı",
      "2011: Prime üyeliğine dâhil edildi",
      "2013: Amazon Studios ilk orijinal dizisini yayınladı",
      "2022: 'The Rings of Power' yayınlandı",
      "2024: Temel pakete reklam eklendi",
    ],
  },
  'HBO Max (Max)': {
    description: [
      "HBO Max Mayıs 2020'de yayına girdi; HBO'nun prestijli kütüphanesini WarnerMedia'nın geniş arşivleriyle (Warner Bros., DC, TNT, TBS, Cartoon Network) birleştirdi. 'Friends' ve 'The Big Bang Theory' gibi klasik dizilerle premium dramayı ve gişe filmlerini sunarak Netflix'e doğrudan rakip olacak şekilde tasarlandı.",
      "Servis çalkantılı bir evrim geçirdi; 2021'deki tartışmalı 'Project Popcorn' kapsamında Warner Bros. tüm sinema filmlerini eş zamanlı olarak HBO Max'te yayınladı. WarnerMedia ve Discovery'nin 2022'deki birleşmesinin ardından servis 2023'te sadece 'Max' olarak yeniden markalandı.",
      "Discovery+'ın senaryosuz içeriklerini de entegre eden Max, 'İzlenecek Tek Adres' olarak konumlanıyor; 'Game of Thrones' ve 'Succession'dan '90 Day Fiancé' ve 'Shark Week'e kadar geniş bir demografiye hitap ediyor.",
    ],
    milestones: [
      "2020: HBO Max lansmanı",
      "2021: Sinemayla aynı gün vizyona girişler (Matrix 4, Dune)",
      "2022: Warner Bros. Discovery birleşmesi tamamlandı",
      "2023: 'Max' olarak yeniden markalandı",
      "2024: House of the Dragon 2. Sezon",
    ],
  },
  'Hulu': {
    description: [
      "Hulu 2007'de News Corporation, NBC Universal, Providence Equity Partners ve daha sonra Disney'in ortak girişimi olarak, TV içeriklerini internetten yayınlamak için kuruldu. Geleneksel medya şirketlerinin dijital dönüşüme yönelik ilk büyük girişimiydi.",
      "'Ertesi gün yayın' modeliyle tanınan Hulu, kullanıcıların güncel dizileri kabloda yayınlandıktan bir gün sonra izlemesine olanak tanıdı. Zamanla Emmy ödüllü 'The Handmaid's Tale' gibi güçlü bir orijinal içerik portföyü geliştirerek prestijli bir içerik üreticisi oldu.",
      "Disney'in 2019'da 21st Century Fox'u satın almasının ardından Hulu'nun tüm operasyonel kontrolünü üstlendi. Servis artık Disney'in aile markalarını Hulu'nun genel eğlence kütüphanesiyle birleştirerek Disney+ ile yakından entegre ediliyor.",
    ],
    milestones: [
      "2008: Halka açık lansman",
      "2011: Orijinal program üretimine başladı",
      "2017: Hulu with Live TV başlatıldı",
      "2017: 'The Handmaid's Tale' En İyi Drama Emmy'sini kazandı",
      "2019: Disney tüm operasyonel kontrolü aldı",
    ],
  },
  'Apple TV+': {
    description: [
      "Apple TV+ Kasım 2019'da rakiplerinden farklı bir stratejiyle yayına girdi: nicelikten çok nitelik. Büyük bir arşiv satın almak yerine Apple, 'The Morning Show' (Jennifer Aniston, Reese Witherspoon) gibi A-sınıfı yeteneklerle yüksek bütçeli orijinal içerik üretmeye odaklandı.",
      "Küçük bir kütüphaneyle başlasa da servis hızla eleştirel beğeni topladı. 2022'de 'CODA' ile En İyi Film Akademi Ödülü'nü kazanan ilk yayın servisi oldu. 'Ted Lasso' komedi dizisi de kültürel bir fenomene dönüşerek üst üste Emmy ödülleri aldı.",
      "Apple ayrıca canlı spora açıldı; Major League Soccer (MLS) ve Major League Baseball (MLB) maçlarının özel haklarını aldı. Servis, Apple One paketinin önemli bir parçası olarak Apple servisleri ekosistemine değer katmaya devam ediyor.",
    ],
    milestones: [
      "2019: 100'den fazla ülkede yayına girdi",
      "2020: 'Ted Lasso' yayınlandı",
      "2022: 'CODA' En İyi Film Oscar'ını kazandı",
      "2023: MLS Season Pass başlatıldı",
      "2025: Fiyat 12,99$/ay\'a yükseldi",
    ],
  },
  'Peacock': {
    description: [
      "Peacock, NBCUniversal'a ait ve onun tarafından işletilen bir Amerikan video yayın servisi. 2020'de yayına giren servis, 'The Office', 'Parks and Recreation' ve 'Saturday Night Live' gibi NBC stüdyolarının içeriklerini, orijinal yapımları ve Premier Lig, WWE gibi canlı sporları sunuyor.",
      "Peacock; ücretsiz reklamlı bir sürüm (erişimi azaltılmış olsa da), reklamlı Premium ve reklamsız Premium Plus kademeleriyle ayrışıyor. Universal Pictures filmlerinin sinema gösteriminden kısa süre sonra yayınlandığı adres olarak hizmet veriyor.",
      "Servis, Olimpiyatlar ve NFL maçları gibi büyük canlı etkinliklerden yararlanarak abone büyümesini hızlandırdı ve geleneksel TV ile modern yayın arasında bir köprü olarak konumlandı.",
    ],
    milestones: [
      "2020: Ulusal lansman",
      "2021: The Office Peacock\'a taşındı",
      "2021: WWE Network entegrasyonu",
      "2023: İlk özel NFL playoff maçı yayını",
      "2023: İlk kez fiyat artışı",
    ],
  },
  'Paramount+': {
    description: [
      "Paramount+, Paramount Global'a ait bir Amerikan talep üzerine video servisi. CBS, Paramount Pictures, Nickelodeon, MTV, BET ve Comedy Central kütüphanelerinden içerikler ile canlı spor ve 'Star Trek: Discovery', 'Yellowstone' yan yapımları gibi orijinaller sunuyor.",
      "Başlangıçta 2014'te CBS All Access olarak kurulan servis, CBS ve Viacom'un birleşmesinin ardından genişleyen kütüphanesini yansıtmak için 2021'de Paramount+ olarak yeniden markalandı. Klasik film ve dizi kataloğundan yararlanarak küresel ölçekte rekabet etmeyi hedefliyor.",
      "Platform, Showtime ile paketlenerek ve UEFA Şampiyonlar Ligi ile NFL maçları gibi büyük spor etkinliklerinin özel haklarını alarak hızla büyüdü.",
    ],
    milestones: [
      "2014: CBS All Access lansmanı",
      "2017: İlk orijinal Star Trek dizisi",
      "2021: Paramount+ olarak yeniden markalandı",
      "2022: Halo dizisinin yayını",
      "2023: Showtime ile entegrasyon",
    ],
  },
  'Crunchyroll': {
    description: [
      "Crunchyroll, binlerce anime, manga ve Asya draması sunan dünyanın en büyük anime yayın servisi. 2006'da bir video paylaşım sitesi olarak kuruldu ve 2009'da yasal lisanslı anime yayınına geçti.",
      "Sony'nin 2021'de Funimation'ı satın almasının ve Funimation ile Crunchyroll'un birleşmesinin ardından Crunchyroll, 200'den fazla ülkede erişilebilen baskın küresel anime platformu oldu. Yeni anime bölümlerini Japonya'daki yayınından saatler sonra eş zamanlı sunuyor.",
      "Servis; anime film dağıtımı, manga yayıncılığı ve özel orijinal anime yapımlarına açılarak dünya çapında anime hayranları için vazgeçilmez bir platform hâline geldi.",
    ],
    milestones: [
      "2006: Video sitesi olarak kuruldu",
      "2009: Lisanslı yayın başladı",
      "2018: 1 milyon aboneye ulaştı",
      "2021: Sony 1,18 milyar $\'a satın aldı",
      "2022: Funimation ile birleşti",
    ],
  },

  // ── Music & Audio ──────────────────────────────────────────────────────────
  'Spotify': {
    description: [
      "Spotify 2006'da İsveç'in Stockholm kentinde Daniel Ek ve Martin Lorentzon tarafından, müzik endüstrisindeki artan korsanlığa yanıt olarak kuruldu. Müzik yayını için yasal ve üstün bir deneyim sunarak kullanıcıları yeniden müziğe para ödemeye ikna etmeyi hedeflediler. Servis 2008'de açıldı, Avrupa'da hızla yayıldı ve 2011'de ABD'ye genişledi.",
      "Platform, müzik tüketimini sahiplikten (albüm/parça satın alma) erişime (yayın) kaydırarak devrim yaptı. 'Freemium' modeli devasa kullanıcı büyümesi sağlarken 'Discover Weekly' gibi kişisel çalma listeleri algoritmik öneride bir altın standart oldu.",
      "Bugün Spotify dünyanın en büyük müzik yayın sağlayıcısı. Podcast ve sesli kitaplara agresif şekilde açıldı; 'The Joe Rogan Experience' gibi şovların özel haklarına ve podcast ağlarına 1 milyar dolardan fazla harcayarak kendini sadece bir müzik çalardan kapsamlı bir ses platformuna dönüştürdü.",
    ],
    milestones: [
      "2006: Stockholm\'de kuruldu",
      "2008: Servis Avrupa\'da açıldı",
      "2011: ABD\'de yayına girdi",
      "2015: Discover Weekly çalma listesi",
      "2019: Gimlet Media satın alındı (podcast hamlesi)",
      "2023: 500 milyon aktif kullanıcıyı aştı",
      "2025: 670 milyon toplam kullanıcıyı aştı",
    ],
  },
  'Apple Music': {
    description: [
      "Apple Music 2015'te, Apple'ın satın aldığı Beats Music'in yerini alarak ve doğrudan iOS ekosistemine entegre olarak başladı. iTunes ve iPhone'un devasa kullanıcı tabanından yararlanarak anında pazar payı kazanan, Spotify'a uzun süredir beklenen Apple yanıtıydı.",
      "Servis, Zane Lowe öncülüğündeki amiral gemisi küresel radyo istasyonu 'Beats 1' (şimdi Apple Music 1) dâhil insan küratörlüğüne odaklanarak ayrışıyor. Spotify'ın aksine ücretsiz reklamlı bir kademe sunmuyor; sanatçı değerini destekleyen yalnızca premium bir ürün olarak konumlanıyor.",
      "Apple ses teknolojisini sürekli ileri taşıdı; Lossless ve Dolby Atmos ile Spatial Audio'yu ek ücret olmadan sundu. 2023'te klasik müziğe özel bir uygulama başlatarak audiofiller ve ciddi müzik hayranları arasındaki itibarını pekiştirdi.",
    ],
    milestones: [
      "2014: Apple, Beats Electronics\'i satın aldı",
      "2015: Apple Music WWDC\'de tanıtıldı",
      "2018: 50 milyon aboneyi aştı",
      "2021: Lossless ve Spatial Audio eklendi",
      "2023: Apple Music Classical uygulaması",
    ],
  },
  'YouTube Premium': {
    description: [
      "YouTube Premium (eski adıyla YouTube Red), YouTube'un sunduğu bir abonelik servisi. Servis genelinde reklamsız erişimin yanı sıra premium YouTube Originals erişimi, mobilde arka planda oynatma ve videoları çevrimdışı izlemek için indirme imkânı sağlıyor.",
      "Servis ilk olarak Kasım 2014'te Music Key adıyla, yalnızca katılımcı plak şirketlerinin müzik videolarının reklamsız yayınını sunarak başlatıldı. 2015'te YouTube Red olarak yeniden başlatıldı ve kapsamı yalnızca müzikle sınırlı kalmayıp tüm videolara reklamsız erişimi içerecek şekilde genişledi.",
      "Mayıs 2018'de YouTube, servisi YouTube Premium olarak yeniden markaladığını ve ayrı bir YouTube Music aboneliğini başlattığını duyurdu. Bugün video yayını, müzik yayını ve içerik üreticisi desteğini birleştiren benzersiz bir değer önerisiyle Google'ın abonelik gelirinin önemli bir parçası.",
    ],
    milestones: [
      "2005: YouTube kuruldu",
      "2006: Google 1,65 milyar $\'a satın aldı",
      "2015: YouTube Red başlatıldı",
      "2018: YouTube Premium olarak yeniden markalandı",
      "2024: 100 milyon aboneyi aştı",
    ],
  },
  'Tidal': {
    description: [
      "Tidal 2014'te kurulan, 2015'te Jay-Z tarafından satın alınan ve 2021'de kısmen Block (eski adıyla Square) tarafından alınan bir müzik yayın servisi. Spotify ve Apple Music'e premium audiofil alternatifi olarak konumlanıyor.",
      "Servis; CD kalitesinde ses sunan HiFi kademesi ve yüksek çözünürlüklü kayıpsız ses, Dolby Atmos ve 360 Reality Audio sağlayan HiFi Plus kademesiyle tanınıyor. Tidal ayrıca sanatçılara daha yüksek telif oranları sunarak ayrışıyor.",
      "Jay-Z'nin katılımıyla Tidal; Beyoncé, Kanye West ve Rihanna gibi sanatçılardan özel çıkışlar elde ederek küratörlü içeriğiyle sanatçı dostu bir platform itibarı kazandı.",
    ],
    milestones: [
      "2014: Aspiro tarafından başlatıldı",
      "2015: Jay-Z tarafından satın alındı",
      "2021: Block (Square) satın alımı",
      "2024: Ücretsiz kademe kaldırıldı",
      "2025: Tüm abonelere kayıpsız ses",
    ],
  },
  'Audible': {
    description: [
      "Audible, kullanıcıların sesli kitap ve diğer sözlü içerikleri satın alıp dinleyebildiği çevrimiçi bir sesli kitap ve podcast servisi. Dünyanın en büyük sesli kitap üreticisi ve satıcısı.",
      "1995'te kurulan Audible, iPod'dan önce ilk taşınabilir dijital ses çaları yarattı. Amazon şirketi 2008'de 300 milyon dolara satın aldı. O zamandan beri özel sesli dramalar ve podcast'ler içeren 'Audible Originals' ile orijinal içerik üretimine açıldı.",
      "Servis, aylık ücretlerin herhangi bir sesli kitapla (fiyatından bağımsız) değiştirilebilen krediler verdiği kredi tabanlı bir abonelik modeliyle çalışıyor; bu da çok okuyanlar için onu oldukça değerli kılıyor.",
    ],
    milestones: [
      "1995: Şirket kuruldu",
      "1997: İlk taşınabilir dijital ses çalar",
      "2008: Amazon tarafından satın alındı",
      "2020: Audible Plus kataloğu başlatıldı",
      "2023: Obama'nın Higher Ground'u ile özel anlaşma",
    ],
  },

  // ── Design & Creativity ────────────────────────────────────────────────────
  'Adobe Creative Cloud': {
    description: [
      "Adobe Creative Cloud; grafik tasarım, video düzenleme, web geliştirme ve fotoğrafçılık için kullanılan bir yazılım koleksiyonu. 2013'te kalıcı lisanslı Creative Suite (CS) modelinin yerini aldı; bu tartışmalı hamle, Adobe'yi bir bulut devine dönüştürdü.",
      "Paket; Photoshop, Illustrator, Premiere Pro ve After Effects gibi sektör standardı uygulamaları içeriyor. Abonelik modeline geçerek Adobe korsanlığı azalttı ve daha önce binlerce dolarlık peşin maliyeti karşılayamayan öğrenciler ile serbest çalışanlar için giriş engelini düşürdü.",
      "Adobe; ticari kullanım için güvenli tasarlanmış üretken yapay zekâ modelleri ailesi Firefly'ı ekleyerek yenilik yapmaya devam ediyor. Bu teknoloji, kullanıcıların Photoshop gibi uygulamaların içinde doğrudan görsel ve metin efektleri üretmesine olanak tanıyarak Adobe'yi dijital yaratıcılığın ön saflarında tutuyor.",
    ],
    milestones: [
      "1982: Adobe kuruldu",
      "1990: Photoshop 1.0 yayınlandı",
      "2013: Tamamen Creative Cloud aboneliğine geçti",
      "2021: Bulut iş birliği için Frame.io satın alındı",
      "2023: Firefly üretken yapay zekâ başlatıldı",
    ],
  },
  'Canva Pro': {
    description: [
      "Canva 2013'te Avustralya'nın Sidney kentinde Melanie Perkins, Cliff Obrecht ve Cameron Adams tarafından kuruldu. Misyonları tasarımı demokratikleştirmek, teknik beceri düzeyinden bağımsız olarak herkes için erişilebilir kılmaktı. Basit bir sürükle-bırak aracı olarak başladı ve kapsamlı bir görsel iletişim platformuna dönüştü.",
      "Canva Pro; Marka Kitleri, arka plan kaldırma ve devasa bir premium stok fotoğraf ile şablon kütüphanesi gibi gelişmiş özellikler sunuyor. Profesyonel yazılımın dik öğrenme eğrisi olmadan hızla kaliteli görseller üretmek isteyen sosyal medya yöneticileri, küçük işletme sahipleri ve pazarlama ekipleri için vazgeçilmez oldu.",
      "Şirket şu anda dünyanın en değerli özel teknoloji girişimlerinden biri. Kısa süre önce kullanıcıların metin, görsel ve video üretmesine olanak tanıyan yapay zekâ destekli araçlar paketi 'Magic Studio'yu tanıtarak yapay zekâ çağında Adobe'ye doğrudan rakip oldu.",
    ],
    milestones: [
      "2013: Sidney\'de başlatıldı",
      "2015: 4 milyon kullanıcıya ulaştı",
      "2019: Pexels ve Pixabay satın alındı",
      "2021: 40 milyar $ değerleme",
      "2023: Magic Studio yapay zekâ başlatıldı",
    ],
  },
  'Figma': {
    description: [
      "Figma, önde gelen iş birlikçi arayüz tasarım aracı. Web için inşa edilmiş; tasarımcı, geliştirici ve paydaşların aynı dosyada aynı anda çalışmasına olanak tanıyarak tasarım iş akışını, Google Docs'un yazımı dönüştürdüğü gibi devrimleştirdi. 2012'de Dylan Field ve Evan Wallace tarafından kuruldu ve tamamen tarayıcıda çalışan ilk profesyonel tasarım aracıydı.",
      "Figma'nın vektör ağları ve bileşen özellikleri, karmaşık ve duyarlı tasarım sistemlerine olanak tanıyor. İş birlikçi beyaz tahta aracı 'FigJam'in tanıtımı, kullanımını saf UI/UX tasarımının ötesine, beyin fırtınası ve diyagram çizimine taşıdı.",
      "2022'de Adobe, Figma'yı 20 milyar dolara satın alma niyetini açıkladı; ancak anlaşma düzenleyici baskı nedeniyle daha sonra iptal edildi. Figma, Netflix, Airbnb ve Zoom gibi ekiplerce kullanılan ürün tasarımının endüstri standardı olmayı sürdürüyor.",
    ],
    milestones: [
      "2015: Kapalı beta lansmanı",
      "2016: Halka açık lansman",
      "2021: FigJam başlatıldı",
      "2022: Başarısız Adobe satın alma girişimi",
      "2023: Geliştiriciler için Dev Mode",
    ],
  },

  // ── AI & Dev Tools ─────────────────────────────────────────────────────────
  'ChatGPT Plus': {
    description: [
      "ChatGPT Plus, OpenAI tarafından geliştirilen yapay zekâ sohbet botu ChatGPT'nin premium abonelik kademesi. Şubat 2023'te başlatıldı; abonelere yoğun saatlerde öncelikli erişim, daha hızlı yanıt ve GPT-4 gibi en yeni modellere özel erişim sunuyor.",
      "OpenAI 2015'te, yapay genel zekânın tüm insanlığa fayda sağlamasını güvence altına alma misyonuyla kâr amacı gütmeyen bir araştırma laboratuvarı olarak kuruldu. 2022 sonunda ChatGPT'nin çıkışı yapay zekâ için bir dönüm noktası oldu ve tarihin en hızlı büyüyen tüketici uygulaması hâline geldi.",
      "Aboneler ayrıca görsel üretimi için DALL·E 3, web tarama yeteneği ve veri analizi araçları gibi gelişmiş özelliklere erişiyor. Geliştiriciler, yazarlar ve farklı sektörlerdeki profesyoneller için bir üretkenlik çarpanı işlevi görüyor.",
    ],
    milestones: [
      "2015: OpenAI kuruldu",
      "2020: GPT-3 yayınlandı",
      "2022: ChatGPT yayınlandı (Kasım)",
      "2023: ChatGPT Plus ve GPT-4 yayınlandı",
      "2024: Sora video modeli duyuruldu",
    ],
  },
  'Claude Pro': {
    description: [
      "Claude Pro, Anthropic'in Claude yapay zekâ asistanının premium aboneliği. 2023 sonunda başlatıldı; daha yüksek mesaj limitleri, yoğun saatlerde öncelikli erişim ve Claude Opus 4 ile Sonnet 4 dâhil en yeni Claude modellerine erişim sunuyor.",
      "Anthropic 2021'de, yapay zekâ güvenliği araştırmasına odaklanan eski OpenAI yöneticileri Dario ve Daniela Amodei tarafından kuruldu. Claude; yardımseverlik, zararsızlık ve dürüstlüğü vurgulayan düşünceli ve ilkeli bir yapay zekâ asistanı olarak konumlanıyor.",
      "Pro aboneleri; genişletilmiş bağlam pencereleri (200K token'a kadar), dosya yükleme ve Projeler aracılığıyla Claude'un kodlama yeteneklerinden yararlanır. Anayasal yapay zekâ yaklaşımını vurgularken ChatGPT Plus ile doğrudan rekabet ediyor.",
    ],
    milestones: [
      "2021: Anthropic kuruldu",
      "2023: Claude 2 yayınlandı",
      "2024: Claude 3 ailesi yayınlandı",
      "2024: Claude Pro ve Team planları başlatıldı",
      "2025: Claude 4 Opus yayınlandı",
    ],
  },
  'GitHub Copilot': {
    description: [
      "GitHub Copilot, GitHub ve OpenAI tarafından geliştirilen yapay zekâ destekli bir kod tamamlama aracı. Geliştiriciler kod yazarken, geliştirme ortamında (IDE) bütün satırlar veya kod blokları öneren bir 'yapay zekâ eş programcısı' olarak çalışıyor.",
      "OpenAI Codex modeli üzerine kurulu olan Copilot, milyarlarca satır açık kaynak kod üzerinde eğitildi. 2022'deki genel erişiminden bu yana; standart kodu otomatikleştirerek, birim testleri yazarak ve geliştiricilerin yeni dil ve çerçeveleri daha hızlı öğrenmesine yardımcı olarak yazılım geliştirmeyi dönüştürdü.",
      "GitHub'ın sahibi Microsoft, sohbet arayüzleri, pull request açıklamaları ve komut satırı yardımını entegre eden 'Copilot X' ile Copilot'un yeteneklerini genişletmeyi sürdürüyor. Yapay zekâ destekli mühendisliğin ön cephesini temsil ediyor.",
    ],
    milestones: [
      "2018: Microsoft GitHub\'ı satın aldı",
      "2021: Copilot Teknik Önizleme başlatıldı",
      "2022: Genel Erişim",
      "2023: Copilot X duyuruldu",
      "2023: Copilot Chat VS Code\'a entegre edildi",
    ],
  },
  'Midjourney': {
    description: [
      "Midjourney, San Francisco merkezli bağımsız araştırma laboratuvarı Midjourney, Inc. tarafından oluşturulan ve barındırılan üretken bir yapay zekâ programı ve servisi. OpenAI'nin DALL-E'si ve Stable Diffusion'a benzer şekilde, 'prompt' adı verilen doğal dil açıklamalarından görseller üretiyor.",
      "Araç şu anda yalnızca bir Discord botu üzerinden erişilebilir; bu da üretim sürecine benzersiz bir topluluk boyutu katıyor. Kullanıcılar birbirlerinin promptlarını ve sonuçlarını görerek iş birlikçi bir öğrenme ortamı oluşturuyor. Midjourney sanatsal tarzı ve yüksek çözünürlüklü çıktısıyla tanınıyor.",
      "Küçük bir ekibe ve risk sermayesi yatırımı olmamasına rağmen Midjourney, üretken yapay zekâ alanının en önde gelen oyuncularından biri oldu ve sanatın ile telif hakkının geleceği üzerine tartışmalar başlattı.",
    ],
    milestones: [
      "2022: Discord üzerinden açık beta lansmanı",
      "2023: V5 Modeli yayınlandı (fotogerçekçilik)",
      "2023: Yüksek talep nedeniyle ücretsiz denemeler sonlandırıldı",
      "2024: Alfa web arayüzü testi",
    ],
  },

  // ── Business & Productivity (SaaS) ─────────────────────────────────────────
  'Microsoft 365': {
    description: [
      "Microsoft 365 (eski adıyla Office 365), teknoloji tarihinin en başarılı iş dönüşümlerinden birini temsil ediyor. 2011'de başlatılan servis, Microsoft'un baskın Office paketini tek seferlik yazılım alımından bulut tabanlı bir abonelik servisine taşıyarak sürekli güncellemeleri ve geliri güvence altına aldı.",
      "Paket; Word, Excel, PowerPoint ve Outlook gibi sektör standardı araçları OneDrive ve Microsoft Teams gibi bulut servisleriyle entegre ediyor. Bu entegrasyon onu işletmeler için vazgeçilmez kıldı; uzaktan çalışma döneminde Teams, iş yeri iş birliğinin merkezi hâline geldi.",
      "Microsoft kısa süre önce üretken yapay zekâ teknolojisi 'Copilot'u 365 paketi genelinde entegre etmeye başladı. Bu sayede kullanıcılar e-posta taslakları hazırlayabiliyor, toplantıları özetleyebiliyor ve sunumları otomatik üretebiliyor; Microsoft 365 işin geleceğinin temel işletim sistemi olarak konumlanıyor.",
    ],
    milestones: [
      "2011: Office 365 Kurumsal başlatıldı",
      "2013: Office 365 Ev başlatıldı",
      "2017: Microsoft Teams başlatıldı",
      "2020: Microsoft 365 olarak yeniden markalandı",
      "2023: Copilot yapay zekâ entegrasyonu duyuruldu",
    ],
  },
  'Google Workspace': {
    description: [
      "Google Workspace (eski adıyla G Suite), Google tarafından geliştirilen bulut bilişim, üretkenlik ve iş birliği araçları koleksiyonu. Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet ve daha fazlasını içeriyor. 2006'da Google Apps for Your Domain olarak başlayan servis, Microsoft'un Office paketine rakip olarak modern iş iletişiminin omurgası oldu.",
      "Bulut yerel yaklaşımı, çıktığı dönemde devrim niteliğinde olan gerçek zamanlı iş birliğine olanak tanıyor. Birden çok kullanıcı tek bir belgeyi aynı anda düzenleyebiliyor; bu da e-posta eklerine ve sürüm kontrolü sorunlarına son veriyor. Küçük girişimlerden Airbus ve Salesforce gibi devasa kuruluşlara kadar herkes tarafından kullanılıyor.",
      "Google kısa süre önce 'Gemini'yi (eski adıyla Duet AI) Workspace'e entegre ederek belge, e-posta taslağı ve slayt oluşturmaya üretken yapay zekâ yetenekleri getirdi ve yapay zekâ odaklı üretkenlik alanında rekabetçi kalmayı güvence altına aldı.",
    ],
    milestones: [
      "2006: Google Apps olarak başlatıldı",
      "2012: Google Drive yayınlandı",
      "2016: G Suite olarak yeniden markalandı",
      "2020: Google Workspace olarak yeniden markalandı",
      "2023: Gemini yapay zekâ entegrasyonu",
    ],
  },
  'Slack': {
    description: [
      "Slack, insanları ihtiyaç duydukları bilgiye bağlayan bir iş mesajlaşma uygulaması. İnsanları tek bir ekip olarak bir araya getirerek kuruluşların iletişim biçimini dönüştürüyor. 2009'da Stewart Butterfield tarafından kuruldu ve Glitch adlı bir oyun geliştirilirken şirket içi bir araç olarak başladı.",
      "Slack'in kanal tabanlı mesajlaşması, birçok teknoloji şirketinde şirket içi iletişimde e-postanın yerini aldı ve modern girişim kültürüyle özdeşleşti. Güçlü API'si Jira, GitHub ve Google Drive gibi binlerce araçla entegrasyona olanak tanıyarak onu iş için merkezi bir komuta merkezi yaptı.",
      "2021'de Slack, tarihin en büyük yazılım satın alımlarından biriyle 27,7 milyar dolara Salesforce tarafından satın alındı. Salesforce Customer 360 ekosistemine daha derin entegre olurken bağımsız bir marka olarak çalışmayı sürdürüyor.",
    ],
    milestones: [
      "2013: Halka açık lansman",
      "2019: NYSE\'de doğrudan halka arz",
      "2020: IBM 350 bin çalışan için Slack\'i seçti",
      "2021: Salesforce tarafından satın alındı",
      "2023: Slack Canvas başlatıldı",
    ],
  },
  'Notion Plus': {
    description: [
      "Notion, günlük iş uygulamalarınızı tek bir yerde birleştiren hepsi bir arada bir çalışma alanı. 'Üretkenlik yazılımının Lego'su' olarak; not alma, proje yönetimi, wiki ve veritabanları için kullanıcıların kendi sistemlerini kurmasına olanak tanıyor. 2013'te kuruldu; 2018 yeniden tasarımıyla viral bir başarıya ulaşmadan önce başlangıçta zorlandı.",
      "Notion'ın blok tabanlı düzenleyicisi tanımlayıcı özelliği; herhangi bir içeriğin taşınmasına, dönüştürülmesine veya gömülmesine olanak tanıyor. Öğrenciler, girişimler ve üretkenlik tutkunları arasında büyük bir kült kitle edinerek canlı bir şablon üreticisi topluluğu oluşturdu.",
      "Notion AI'nin çıkışıyla platform, üretken metin yeteneklerini doğrudan düzenleyiciye entegre etti; kullanıcılar çalışma alanından ayrılmadan beyin fırtınası yapabiliyor, özetleyebiliyor ve çeviri yapabiliyor.",
    ],
    milestones: [
      "2016: Notion 1.0 yayınlandı",
      "2018: Notion 2.0 (Veritabanları) yayınlandı",
      "2020: Kişisel plan ücretsiz yapıldı",
      "2021: 10 milyar $ değerleme",
      "2023: Notion AI başlatıldı",
    ],
  },
  'Zoom Pro': {
    description: [
      "Zoom, Zoom Video Communications tarafından geliştirilen bir görüntülü iletişim yazılımı. Pro planı toplantılardaki 40 dakika sınırını kaldırıyor ve bulut kaydı ile yönetici kontrolleri ekliyor. COVID-19 pandemisi sırasında uzaktan çalışma ve sanal sosyal buluşmaların varsayılan aracı olarak bir ev adı hâline geldi.",
      "2011'de eski bir Cisco mühendisi olan Eric Yuan tarafından kurulan Zoom, görüntülü aramaları güvenilir ve kullanımı kolay yapmaya odaklandı. 'Freemium' modeli, okullarda ve işletmelerde viral yayılıma olanak tanıdı.",
      "Pandemi sonrası Zoom; Zoom Phone, Zoom Rooms ve AI Companion özellikleriyle tam bir iletişim platformuna açıldı ve modern hibrit iş yerinin işletim sistemi olmayı hedefliyor.",
    ],
    milestones: [
      "2011: Kuruldu",
      "2013: Halka açık lansman",
      "2019: Halka arz",
      "2020: Pandemide 30 kat büyüme",
      "2023: Zoom AI Companion başlatıldı",
    ],
  },
  'Dropbox Plus': {
    description: [
      "Dropbox; bulut depolama, dosya senkronizasyonu, kişisel bulut ve istemci yazılımı sunan bir dosya barındırma servisi. Dropbox Plus; 2TB depolama, çevrimdışı erişim ve gelişmiş paylaşım kontrolleri sunan kişisel ücretli kademe.",
      "2007'de Drew Houston ve Arash Ferdowsi tarafından kurulan Dropbox, cihazlar arasında senkronize olan bir 'sihirli klasör' kavramını popülerleştirdi. Y Combinator girişim hızlandırıcısının ilk büyük başarılarından biriydi.",
      "Google Drive ve OneDrive ile sert rekabete rağmen Dropbox; HelloSign (e-imza) ve DocSend gibi araçları satın alarak 'akıllı çalışma alanı' özelliklerine yöneldi ve yaratıcı profesyoneller ile serbest çalışanlar için belge iş akışlarını kolaylaştırdı.",
    ],
    milestones: [
      "2007: Y Combinator lansmanı",
      "2011: 50 milyon kullanıcıya ulaştı",
      "2018: NASDAQ\'ta halka arz",
      "2019: HelloSign satın alındı",
      "2023: Dropbox Dash yapay zekâ başlatıldı",
    ],
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  'Xbox Game Pass': {
    description: [
      "Xbox Game Pass yaygın olarak 'video oyunlarının Netflix'i' kabul ediliyor. Microsoft tarafından 2017'de başlatılan servis, aylık bir ücret karşılığında 100'den fazla yüksek kaliteli oyundan oluşan dönen bir kataloğa erişim sağlıyor. Oyun sektörünün iş modelini birim satıştan yinelenen aboneliğe taşıyarak kökten değiştirdi.",
      "Game Pass'in en önemli farkı, tüm birinci taraf Xbox oyunlarının (Halo, Forza ve Starfield gibi) servise ilk gün eklenmesi. Bu agresif strateji; konsol, PC ve bulut yayını üzerinden mobilde kullanıcıları Xbox ekosistemine bağlamayı hedefliyor.",
      "Servisin değeri, Microsoft'un ZeniMax Media (Bethesda) ve Activision Blizzard'ı satın almasıyla önemli ölçüde arttı. Bu satın almalar 'Call of Duty', 'Fallout' ve 'The Elder Scrolls' gibi devasa serileri Game Pass çatısı altına getirdi.",
    ],
    milestones: [
      "2017: Servis başlatıldı",
      "2019: PC için Game Pass başlatıldı",
      "2020: xCloud yayını Ultimate\'a eklendi",
      "2021: Bethesda oyunları eklendi",
      "2023: Activision Blizzard satın alımı tamamlandı",
    ],
  },
  'PlayStation Plus': {
    description: [
      "PlayStation Plus, Sony Interactive Entertainment'in PlayStation konsolları için sunduğu bir abonelik servisi. Başlangıçta 2010'da ücretsiz oyun ve indirimler sağlamak için başlatıldı; artık PS4 ve PS5'te çevrimiçi çok oyunculu oyun için gerekli.",
      "2022'de Sony servisi üç kademeye dönüştürdü: Essential, Extra ve Premium. Üst kademeler; geniş bir PS4 ve PS5 oyunu kütüphanesinin yanı sıra önceki PlayStation nesillerinden klasik başlıkların kataloğunu sunarak Xbox Game Pass ile doğrudan rekabet ediyor.",
      "Servis PlayStation ekosisteminin ayrılmaz bir parçası; PS5 sahiplerine özel 'PS Plus Collection' başlıkları ve eski oyunlar için bulut yayını sunarak bulut üzerinden geriye dönük uyumluluğu sağlıyor.",
    ],
    milestones: [
      "2010: PS3\'te başlatıldı",
      "2013: PS4 çevrimiçi oyun için zorunlu hâle geldi",
      "2020: PS5 için PS Plus Collection",
      "2022: Extra/Premium kademeleriyle yeniden başlatıldı",
      "2023: PS5 oyunları için bulut yayını",
    ],
  },
  'Nintendo Switch Online': {
    description: [
      "Nintendo Switch Online, Nintendo'nun 2018'de başlattığı Switch konsolu abonelik servisi. Nintendo oyunları için çevrimiçi çok oyunculuyu etkinleştiriyor, klasik NES, SNES, N64 ve Game Boy başlıklarından oluşan bir kütüphane sağlıyor ve bulut kaydı işlevi sunuyor.",
      "Expansion Pack kademesi; Nintendo 64, Sega Genesis ve Game Boy Advance klasiklerini ve Mario Kart 8 Deluxe ile Splatoon gibi seçili birinci taraf oyunların DLC'lerini ekliyor. Tam Switch çevrimiçi deneyimi için vazgeçilmez olarak konumlanıyor.",
      "38 milyondan fazla abonesiyle, Nintendo'nun Mario, Zelda ve Pokémon gibi sevilen serilerinden oluşan devasa kütüphanesinden yararlanarak dünyanın en popüler oyun aboneliklerinden biri.",
    ],
    milestones: [
      "2018: Servis başlatıldı",
      "2019: SNES kütüphanesi eklendi",
      "2021: Expansion Pack başlatıldı",
      "2022: Game Boy ve GBA eklendi",
      "2024: 38 milyon abone",
    ],
  },
  'Twitch Turbo': {
    description: [
      "Twitch Turbo, yalnızca Twitch.tv'de sunulan aylık bir abonelik programı. Site genelinde reklamsız bir izleme deneyimi sağlıyor; bu da birden çok yayıncıyı izleyen yoğun kullanıcılar için önemli bir avantaj.",
      "Reklamsız izlemenin yanı sıra Turbo aboneleri; özel bir emoji seti, genişletilmiş sohbet renk seçenekleri ve sohbette öncelikli bir rozet alıyor. Belirli kanal emojilerini sağlamasa da kullanıcıların tek tek kanallara abone olmak yerine platformu doğrudan desteklemesine olanak tanıyor.",
      "2011'de Justin.tv'nin bir uzantısı olarak kurulan Twitch, 2014'te Amazon tarafından 970 milyon dolara satın alındı. Özellikle video oyunları ve espor alanında canlı yayın pazarına hâkim.",
    ],
    milestones: [
      "2011: Justin.tv uzantısı olarak başlatıldı",
      "2013: Twitch Turbo başlatıldı",
      "2014: Amazon tarafından satın alındı",
      "2016: Twitch Prime (şimdi Prime Gaming) başlatıldı",
      "2023: Bazı bölgelerde Turbo fiyatı arttı",
    ],
  },

  // ── Community & Learning ───────────────────────────────────────────────────
  'Discord Nitro': {
    description: [
      "Discord Nitro, popüler sohbet uygulaması Discord'un premium abonelik servisi. Kullanıcı verisi satan veya reklam gösteren diğer sosyal platformların aksine Discord'un gelir modeli tamamen Nitro aboneliklerine dayanıyor. Kullanıcılara; daha yüksek kaliteli video yayını, daha büyük dosya yüklemeleri ve tüm sunucularda özel emojiler gibi gelişmiş özellikler sunuyor.",
      "Discord 2015'te oyuncular için bir VoIP aracı olarak kuruldu; ancak o zamandan beri kripto meraklıları, çalışma grupları ve hobiciler tarafından kullanılan genel amaçlı bir topluluk platformuna dönüştü. Nitro, kullanıcıların profillerini animasyonlu avatarlar ve afişlerle kişiselleştirmesine olanak tanıyarak toplulukta bir statü sembolü işlevi görüyor.",
      "Servisin iki kademesi var: Nitro Basic ve tam Nitro. Tam Nitro; toplulukların belirli bir sunucudaki herkes için avantajların kilidini açmasına yardımcı olan 2 Sunucu Takviyesi içeriyor ve toplulukçu bir destek modelini besliyor.",
    ],
    milestones: [
      "2015: Discord lansmanı",
      "2017: Nitro aboneliği başlatıldı",
      "2020: 'Your Place to Talk' olarak yeniden markalandı",
      "2021: 12 milyar $\'lık Microsoft satın alma teklifi reddedildi",
      "2022: Nitro Basic kademesi tanıtıldı",
    ],
  },
  'Duolingo Super': {
    description: [
      "Duolingo, dünyanın en popüler dil öğrenme platformu. 'Super Duolingo' (eski adıyla Duolingo Plus); reklamları kaldıran, sınırsız can (hata hakkı) sağlayan ve hataları gözden geçirmek için kişiselleştirilmiş alıştırma oturumları sunan premium abonelik.",
      "2011'de Luis von Ahn (CAPTCHA'nın mucidi) ve Severin Hacker tarafından kurulan uygulama; serileri, liderlik tabloları ve ligler gibi oyunlaştırma öğeleriyle kullanıcıları bağlı tutuyor. Maskotu Duo the Owl, alıştırma yapmaya yönelik ısrarlı hatırlatmalarıyla viral bir mem hâline geldi.",
      "Duolingo, hepsi aynı uygulama içinde olmak üzere dillerin ötesine, Matematik ve Müzik derslerine açıldı. Şirket 2021'de halka açıldı ve her öğrencinin yeterlilik düzeyine göre dersleri kişiselleştirmek için yapay zekâ kullanmayı sürdürüyor.",
    ],
    milestones: [
      "2011: Halka açık beta lansmanı",
      "2013: Apple Yılın Uygulaması",
      "2017: Duolingo Plus başlatıldı",
      "2021: NASDAQ\'ta halka arz",
      "2023: Plus, Super Duolingo olarak yeniden markalandı",
    ],
  },
  'MasterClass': {
    description: [
      "MasterClass, öğrencilerin çeşitli alanlardaki uzmanlar tarafından önceden kaydedilmiş ders ve anlatımlara erişebildiği bir çevrimiçi eğitim abonelik platformu. Gordon Ramsay ile yemek pişirmekten Natalie Portman ile oyunculuğa kadar, sinema kalitesinde yapımlarla 'eğitim-eğlence' sunuyor.",
      "2014'te kurulan platform, eğitmenlerinin ünlü statüsüyle ayrışıyor. 180'den fazla dersin tamamına erişim sağlayan yıllık bir üyelik satıyor. Sadece teknik sertifika değil, ilham arayan ömür boyu öğrenenlere hitap ediyor.",
      "MasterClass, şirketlerin servisi çalışanlarına bir ayrıcalık olarak sunmasına olanak tanıyan kurumsal tekliflere açıldı. Çevrimiçi öğrenmede üst düzey, hikâye odaklı içeriğe doğru bir kaymayı temsil ediyor.",
    ],
    milestones: [
      "2015: 3 eğitmenle başlatıldı",
      "2018: 80 milyon $ Seri D yatırımı",
      "2020: Pandemide kullanım arttı",
      "2021: Değerleme 2,75 milyar $\'a üçe katlandı",
      "2023: Uygulamalı öğrenme için 'Sessions' başlatıldı",
    ],
  },

  // ── Shopping & Local ───────────────────────────────────────────────────────
  'Amazon Prime': {
    description: [
      "Amazon Prime, kullanıcılara çok çeşitli avantajlar (en önemlisi uygun ürünlerde ücretsiz iki günlük veya daha hızlı teslimat) sunan, Amazon'un ücretli bir abonelik servisi. E-ticaret sadakat programlarının altın standardı oldu.",
      "Kargonun ötesinde Prime; Prime Video, Amazon Music Prime, Prime Gaming ve Prime Day gibi etkinliklerde özel fırsatlara erişim içeriyor. Üyeleri neredeyse yalnızca Amazon'dan alışveriş yapmaya teşvik eden bir ekosistem kilidi işlevi görüyor.",
      "Dünya çapında 200 milyondan fazla abonesiyle Prime, Amazon için devasa bir gelir kaynağı ve perakende ile eğlenceye aynı anda hâkim olma stratejisinin kilit bir parçası.",
    ],
    milestones: [
      "2005: Prime başlatıldı (79$/yıl)",
      "2011: Prime Video eklendi",
      "2014: Fiyat 99$\'a yükseldi",
      "2015: İlk Prime Day",
      "2021: 200 milyon üyeye ulaştı",
    ],
  },
};
