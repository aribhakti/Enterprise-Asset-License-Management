import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, CreditCard, Sparkles, ArrowRight, Wallet, Bell, Play, Zap, 
  CheckCircle2, DollarSign, TrendingUp, Users, Calendar, Server, 
  Database, Lock, AlertTriangle, FileWarning, XCircle, ChevronRight,
  Layout, Search, Siren, ShieldCheck, MessageCircle, HelpCircle,
  Mail, Phone, MapPin, ChevronDown, Check, Cloud, FileCheck,
  Activity, BarChart3, Radio, Fingerprint, Scan, Sun, Moon, Globe
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onTryNow: () => void;
}

type Lang = 'en' | 'id';

const TRANSLATIONS = {
  en: {
    nav: { signIn: "Sign In", access: "Access Registry" },
    hero: {
      tag: "Enterprise Asset & License Management",
      title1: "Stop the",
      title2: "Start the",
      highlight1: "Bleeding.",
      highlight2: "Control.",
      desc: "The first financial control system designed for modern IT assets. Track SaaS, Hardware, and Cloud spend without the ITSM bloat.",
      cta: "Initialize Registry",
      demo: "Watch Protocol Demo",
      metrics: { m1: "Assets Tracked", m2: "Audit Success", m3: "Churn Prevented" }
    },
    live: {
      label: "Live Dashboard View",
      a1: { t: "Renewal Alert: Salesforce", d: "Contract expires in 12 days. Auto-renew enabled." },
      a2: { t: "Shadow IT Detected", d: "New vendor 'Figma' found in credit card statement." },
      a3: { t: "Savings Opportunity", d: "25 Zoom licenses inactive for >90 days." }
    },
    problem: {
      tag: "The Enterprise Blindspot",
      title: "Spreadsheets are",
      highlight: "Financial Suicide.",
      desc: "Managing millions in assets on a static sheet isn't just inefficient—it's negligent. Here is what happens when you don't have a system.",
      c1: { t: "The Auto-Renew Trap", d: "Missed the 60-day notice window? Congratulations, you just bought another year of software you don't use at a 10% price hike." },
      c2: { t: "Zombie Licenses", d: "Employees leave, but their $500/mo seats stay active. We typically find 20-30% of enterprise SaaS spend is completely wasted." },
      c3: { t: "Audit Panic", d: "Auditors demand proof of entitlement. You're scrambling through emails for PDFs. One missing document costs thousands in fines." }
    },
    features: {
      tag: "System Capabilities",
      title: "Complete Financial Control",
      desc: "From procurement to decommissioning, SubGuard handles the entire lifecycle of your business assets.",
      cards: {
        f1: { t: "Unified Registry", d: "Centralize SaaS, Hardware, Cloud, and Services in one audit-proof vault." },
        f2: { t: "Smart Alerts", d: "Get notified 90, 60, and 30 days before renewals. Never miss a cancellation window." },
        f3: { t: "Risk Engine", d: "Auto-score vendors based on dependency, contract terms, and price hike history." },
        f4: { t: "Shadow Detection", d: "Identify unapproved tools and spending anomalies before they become security risks." },
        f5: { t: "Lifecycle Workflow", d: "Manage approvals, onboarding, and offboarding with strict governance." },
        f6: { t: "Seat Optimization", d: "Track utilization per user. Reclaim unused licenses automatically." },
        f7: { t: "Audit Ready", d: "Store contracts, invoices, and compliance docs linked directly to assets." },
        f8: { t: "Budget Forecasting", d: "Project next year's spend with inflation adjustments and usage trends." },
      }
    },
    pricing: {
      title: "Transparent Investment",
      desc: "Choose the level of control your organization needs",
      p1: { t: "Personal", d: "For consultants and freelancers.", b: "Start Free", f: ["Up to 20 Assets", "Basic Alerts", "Manual Entry", "Excel Export"] },
      p2: { t: "Small Company", d: "For growing teams needing organization.", b: "Start Trial", f: ["Unlimited Assets", "5 Team Members", "Document Storage", "Renewal Workflows", "Email & WhatsApp Alerts"] },
      p3: { t: "Enterprise", d: "For organizations requiring governance.", b: "Contact Sales", f: ["SSO / SAML", "Unlimited Seats", "Custom Integrations", "Dedicated Account Manager", "SLA & Audit Logs"] }
    },
    stakeholder: {
      tag: "Stakeholder Synchronization",
      title: "Unified",
      highlight: "Command Center",
      desc: "Eliminate friction between departments. SubGuard provides tailored intelligence for every key player in the organization.",
      c1: { t: "Financial Controller", r: "CFO", q: "I need absolute certainty on next year's commit.", b: ["CapEx/OpEx Splitting", "Inflation Modelling", "Budget Variance"] },
      c2: { t: "IT Director", r: "CIO", q: "Shadow IT is a security nightmare waiting to happen.", b: ["SOC2 Compliance", "Access Governance", "Vendor Risk Scoring"] },
      c3: { t: "Operations Lead", r: "COO", q: "Approvals are stuck in email threads forever.", b: ["Automated Workflows", "SLA Monitoring", "Procurement Velocity"] }
    },
    faq: {
      tag: "Knowledge Base",
      title: "Frequently Asked Questions",
      desc: "Everything you need to know about securing your financial perimeter.",
      q1: { q: "Is my financial data encrypted?", a: "We utilize bank-grade AES-256 encryption for all data at rest and in transit. Our infrastructure is ISO 27001 certified and SOC2 Type II compliant." },
      q2: { q: "Does SubGuard sync with accounting software?", a: "Yes. We offer native integrations for Xero, QuickBooks, and NetSuite. You can also use our API to build custom workflows." },
      q3: { q: "Can I track physical assets like laptops?", a: "Absolutely. SubGuard is a unified registry. Track hardware serial numbers, assignment history, and warranty expiry alongside your SaaS subscriptions." },
      q4: { q: "How do you detect 'Shadow IT'?", a: "Our 'Discovery Mode' analyzes imported bank statements or credit card feeds to identify recurring payments to unrecognized vendors automatically." },
      q5: { q: "Can I get alerts on Slack or Microsoft Teams?", a: "Yes. Our notification engine supports Email, Slack, Microsoft Teams, and even WhatsApp for critical renewal alerts." },
      q6: { q: "Do you charge per asset tracked?", a: "No. Our pricing is based on team members (admin users). You can track unlimited assets and vendors on all paid plans." },
      q7: { q: "I have a messy Excel sheet. Can you help?", a: "Our 'Smart Import' tool uses AI to map your columns automatically. If you have over 500 assets, our onboarding team will handle the migration for free." },
      q8: { q: "Bisakah SubGuard membatalkan langganan?", a: "We provide the intelligence and the 'Cancel' workflow (templates, contact info), but for security, we do not execute the final cancellation transaction on your behalf." },
    },
    contact: {
      title: "Get in Touch",
      desc: "Ready to take control of your enterprise assets? Our team is here to help you set up your registry and import your data.",
      info: { email: "Email Us", phone: "WhatsApp / Phone", loc: "HQ Location" },
      form: { n: "Name", e: "Work Email", m: "Message", b: "Send Message" }
    },
    cta: {
      title: "Ready to secure your",
      highlight: "Financial Perimeter?",
      desc: "Join forward-thinking enterprises moving their asset management from 'Hope & Excel' to the SubGuard Protocol.",
      b1: "Start Free Trial",
      b2: "View Live Demo",
      note: "No credit card required for Sandbox • SOC2 Compliant"
    }
  },
  id: {
    nav: { signIn: "Masuk", access: "Akses Registry" },
    hero: {
      tag: "Manajemen Aset & Lisensi Perusahaan",
      title1: "Hentikan",
      title2: "Mulai",
      highlight1: "Kebocoran.",
      highlight2: "Kendali Penuh.",
      desc: "Sistem kontrol keuangan pertama untuk aset IT modern. Lacak pengeluaran SaaS, Hardware, dan Cloud tanpa kerumitan ITSM.",
      cta: "Mulai Registry",
      demo: "Lihat Demo Protokol",
      metrics: { m1: "Aset Dilacak", m2: "Sukses Audit", m3: "Churn Dicegah" }
    },
    live: {
      label: "Tampilan Dashboard Langsung",
      a1: { t: "Peringatan: Salesforce", d: "Kontrak berakhir dalam 12 hari. Perpanjangan otomatis aktif." },
      a2: { t: "Shadow IT Terdeteksi", d: "Vendor baru 'Figma' ditemukan dalam tagihan kartu kredit." },
      a3: { t: "Peluang Penghematan", d: "25 lisensi Zoom tidak aktif selama >90 hari." }
    },
    problem: {
      tag: "Titik Buta Perusahaan",
      title: "Spreadsheet adalah",
      highlight: "Bunuh Diri Finansial.",
      desc: "Mengelola aset jutaan dolar di lembar statis bukan hanya tidak efisien—it's negligent. Inilah yang terjadi tanpa sistem.",
      c1: { t: "Jebakan Auto-Renew", d: "Melewatkan jendela pemberitahuan 60 hari? Selamat, Anda baru saja membeli setahun lagi software yang tidak Anda gunakan dengan kenaikan harga 10%." },
      c2: { t: "Lisensi Zombie", d: "Karyawan keluar, tetapi kursi $500/bln mereka tetap aktif. Kami biasanya menemukan 20-30% pengeluaran SaaS perusahaan terbuang sia-sia." },
      c3: { t: "Kepanikan Audit", d: "Auditor meminta bukti kepemilikan. Anda mengacak-acak email mencari PDF. Satu dokumen hilang bisa berharga ribuan dolar dalam denda." }
    },
    features: {
      tag: "Kapabilitas Sistem",
      title: "Kontrol Keuangan Penuh",
      desc: "Dari pengadaan hingga penonaktifan, SubGuard menangani seluruh siklus hidup aset bisnis Anda.",
      cards: {
        f1: { t: "Registry Terpadu", d: "Sentralisasi SaaS, Hardware, Cloud, dan Layanan dalam satu brankas tahan audit." },
        f2: { t: "Peringatan Cerdas", d: "Dapatkan notifikasi 90, 60, dan 30 hari sebelum perpanjangan. Jangan lewatkan jendela pembatalan." },
        f3: { t: "Mesin Risiko", d: "Skor otomatis vendor berdasarkan ketergantungan, ketentuan kontrak, dan riwayat kenaikan harga." },
        f4: { t: "Deteksi Shadow", d: "Identifikasi alat yang tidak disetujui dan anomali pengeluaran sebelum menjadi risiko keamanan." },
        f5: { t: "Workflow Siklus", d: "Kelola persetujuan, onboarding, dan offboarding dengan tata kelola yang ketat." },
        f6: { t: "Optimasi Kursi", d: "Lacak penggunaan per pengguna. Klaim kembali lisensi yang tidak terpakai secara otomatis." },
        f7: { t: "Siap Audit", d: "Simpan kontrak, faktur, dan dokumen kepatuhan yang ditautkan langsung ke aset." },
        f8: { t: "Prakiraan Anggaran", d: "Proyeksikan pengeluaran tahun depan dengan penyesuaian inflasi dan tren penggunaan." },
      }
    },
    pricing: {
      title: "Investasi Transparan",
      desc: "Pilih tingkat kontrol yang dibutuhkan organisasi Anda",
      p1: { t: "Personal", d: "Untuk konsultan dan freelancer.", b: "Mulai Gratis", f: ["Hingga 20 Aset", "Peringatan Dasar", "Entri Manual", "Ekspor Excel"] },
      p2: { t: "Perusahaan Kecil", d: "Untuk tim berkembang yang butuh organisasi.", b: "Mulai Uji Coba", f: ["Aset Tak Terbatas", "5 Anggota Tim", "Penyimpanan Dokumen", "Alur Kerja Perpanjangan", "Alert Email & WhatsApp"] },
      p3: { t: "Enterprise", d: "Untuk organisasi yang butuh tata kelola.", b: "Hubungi Sales", f: ["SSO / SAML", "Kursi Tak Terbatas", "Integrasi Kustom", "Manajer Akun Khusus", "SLA & Log Audit"] }
    },
    stakeholder: {
      tag: "Sinkronisasi Stakeholder",
      title: "Pusat Komando",
      highlight: "Terpadu",
      desc: "Hilangkan gesekan antar departemen. SubGuard menyediakan intelijen yang disesuaikan untuk setiap pemain kunci dalam organisasi.",
      c1: { t: "Kontroler Keuangan", r: "CFO", q: "Saya butuh kepastian mutlak pada komitmen tahun depan.", b: ["Pemisahan CapEx/OpEx", "Pemodelan Inflasi", "Variansi Anggaran"] },
      c2: { t: "Direktur IT", r: "CIO", q: "Shadow IT adalah mimpi buruk keamanan yang menunggu terjadi.", b: ["Kepatuhan SOC2", "Tata Kelola Akses", "Skor Risiko Vendor"] },
      c3: { t: "Kepala Operasional", r: "COO", q: "Persetujuan macet di utas email selamanya.", b: ["Workflow Otomatis", "Pemantauan SLA", "Kecepatan Pengadaan"] }
    },
    faq: {
      tag: "Pusat Pengetahuan",
      title: "Pertanyaan Umum",
      desc: "Segala yang perlu Anda ketahui tentang mengamankan perimeter keuangan Anda.",
      q1: { q: "Apakah data keuangan saya terenkripsi?", a: "Kami menggunakan enkripsi AES-256 tingkat bank untuk semua data. Infrastruktur kami bersertifikat ISO 27001 dan patuh SOC2 Tipe II." },
      q2: { q: "Apakah SubGuard sinkron dengan software akuntansi?", a: "Ya. Kami menawarkan integrasi asli untuk Xero, QuickBooks, dan NetSuite. Anda juga dapat menggunakan API kami." },
      q3: { q: "Bisakah saya melacak aset fisik seperti laptop?", a: "Tentu. SubGuard adalah registry terpadu. Lacak nomor seri hardware, riwayat penugasan, dan garansi." },
      q4: { q: "Bagaimana cara mendeteksi 'Shadow IT'?", a: "Mode Penemuan kami menganalisis laporan bank atau feed kartu kredit untuk mengidentifikasi pembayaran berulang ke vendor tak dikenal." },
      q5: { q: "Bisakah dapat alert di Slack atau WhatsApp?", a: "Ya. Mesin notifikasi kami mendukung Email, Slack, Microsoft Teams, dan bahkan WhatsApp untuk peringatan kritis." },
      q6: { q: "Apakah biaya dihitung per aset?", a: "Tidak. Harga kami berdasarkan anggota tim (user admin). Anda dapat melacak aset dan vendor tak terbatas." },
      q7: { q: "Saya punya Excel yang berantakan. Bisa bantu?", a: "Alat 'Smart Import' kami menggunakan AI untuk memetakan kolom Anda. Jika aset >500, tim kami akan menangani migrasi gratis." },
      q8: { q: "Bisakah SubGuard membatalkan langganan?", a: "Kami menyediakan intelijen dan alur kerja 'Batal', tetapi demi keamanan, kami tidak mengeksekusi transaksi pembatalan." },
    },
    contact: {
      title: "Hubungi Kami",
      desc: "Siap mengendalikan aset perusahaan Anda? Tim kami siap membantu Anda mengatur registry dan mengimpor data.",
      info: { email: "Email Kami", phone: "WhatsApp / Telepon", loc: "Lokasi Kantor" },
      form: { n: "Nama", e: "Email Kerja", m: "Pesan", b: "Kirim Pesan" }
    },
    cta: {
      title: "Siap mengamankan",
      highlight: "Perimeter Finansial?",
      desc: "Bergabunglah dengan perusahaan maju yang memindahkan manajemen aset dari 'Harapan & Excel' ke Protokol SubGuard.",
      b1: "Mulai Uji Coba Gratis",
      b2: "Lihat Demo Langsung",
      note: "Tanpa kartu kredit untuk Sandbox • Patuh SOC2"
    }
  }
};

export const LandingPage: React.FC<Props> = ({ onGetStarted, onTryNow }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  
  const heroCardRef = useRef<HTMLDivElement>(null);
  
  // Toggle Dark Mode Class on Root
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = TRANSLATIONS[lang];
  
  // JSON-LD Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SubGuard",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": t.hero.desc,
    "offers": {
      "@type": "Offer",
      "price": "49",
      "priceCurrency": "USD",
      "category": "Monthly Subscription"
    },
    "featureList": Object.values(t.features.cards).map((c: any) => c.t).join(", "),
    "screenshot": "https://subguard.io/og-image.jpg"
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const { left, top, width, height } = heroCardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    const tiltX = (0.5 - y) * 20; 
    const tiltY = (x - 0.5) * 20;
    heroCardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!heroCardRef.current) return;
    heroCardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
      
      {/* Inject JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/628567234922" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center gap-2 group hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)]"
      >
        <MessageCircle className="w-7 h-7 animate-bounce" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-black text-xs uppercase tracking-widest pl-0 group-hover:pl-2">
          Chat
        </span>
      </a>

      {/* Global Tech Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className={`absolute inset-0 bg-[size:24px_24px] transition-colors duration-500 ${isDarkMode ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]'}`}></div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b px-6 py-4 transition-all ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-white/50 hover:bg-white/95'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={onTryNow} role="button" aria-label="Go to homepage">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 group-hover:rotate-12 group-hover:scale-110">
              <Zap className="w-5 h-5 text-white dark:text-slate-950" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-fuchsia-500 transition-all">subguard</span>
          </div>
          
          <nav className="flex items-center gap-6">
            {/* Toggles */}
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-6 mr-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  aria-label="Toggle Dark Mode"
                  className={`p-2 rounded-full transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${isDarkMode ? 'text-yellow-400' : 'text-slate-400'}`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
                  aria-label="Switch Language"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Globe className="w-4 h-4" /> {lang}
                </button>
            </div>

            <button onClick={onGetStarted} className="hidden sm:block text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors hover:scale-105">{t.nav.signIn}</button>
            <button onClick={onTryNow} className="hover-shine bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6 py-2.5 rounded-xl text-[10px] font-black text-white transition-all shadow-lg shadow-indigo-200 dark:shadow-none uppercase tracking-widest active:scale-95 hover:-translate-y-0.5">{t.nav.access}</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative z-10" id="hero">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 relative z-10">
            <article className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-default">
                <Shield className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> {t.hero.tag}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                {t.hero.title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500">{t.hero.highlight1}</span><br/>
                {t.hero.title2} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500">{t.hero.highlight2}</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-bold animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {t.hero.desc}
              </p>
            </article>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <button onClick={onGetStarted} aria-label="Initialize Registry" className="hover-shine bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:-translate-y-1 group">
                {t.hero.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-fuchsia-400 dark:text-indigo-600" />
              </button>
              <button onClick={onTryNow} aria-label="Watch Demo" className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition-all hover:shadow-inner">
                <Play className="w-4 h-4 fill-current" /> {t.hero.demo}
              </button>
            </div>

            <div className="flex gap-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <TrustMetric label={t.hero.metrics.m1} value="$4B+" />
                <TrustMetric label={t.hero.metrics.m2} value="100%" />
                <TrustMetric label={t.hero.metrics.m3} value="12k+" />
            </div>
          </div>

          <div 
             className="relative animate-in fade-in zoom-in duration-1000 delay-200 perspective-1000"
             onMouseMove={handleMouseMove}
             onMouseLeave={handleMouseLeave}
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 blur-3xl -z-10 rounded-full"></div>
             <div 
                ref={heroCardRef}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-2xl relative z-10 transition-transform duration-100 ease-out transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
             >
                <div className="flex justify-between items-center mb-8 pointer-events-none">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">{t.live.label}</div>
                </div>
                <div className="space-y-4 pointer-events-none">
                   <AlertItem title={t.live.a1.t} desc={t.live.a1.d} type="danger" />
                   <AlertItem title={t.live.a2.t} desc={t.live.a2.d} type="warning" />
                   <AlertItem title={t.live.a3.t} desc={t.live.a3.d} type="success" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Content Visibility Auto for Performance */}
      <section className="py-24 bg-slate-900 dark:bg-slate-950 relative overflow-hidden group z-10 content-visibility-auto" id="problem">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 group-hover:opacity-10 transition-opacity duration-1000"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-rose-500 font-black text-xs uppercase tracking-[0.3em] mb-4 block animate-pulse">{t.problem.tag}</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">{t.problem.title} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">{t.problem.highlight}</span></h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">{t.problem.desc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProblemCard 
              icon={<AlertTriangle className="w-8 h-8 text-rose-500" />}
              title={t.problem.c1.t}
              desc={t.problem.c1.d}
              delay="0"
            />
            <ProblemCard 
              icon={<XCircle className="w-8 h-8 text-orange-500" />}
              title={t.problem.c2.t}
              desc={t.problem.c2.d}
              delay="100"
            />
             <ProblemCard 
              icon={<FileWarning className="w-8 h-8 text-yellow-500" />}
              title={t.problem.c3.t}
              desc={t.problem.c3.d}
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* Features Deep Dive Section - Content Visibility Auto */}
      <section className="py-24 bg-white dark:bg-slate-900 relative z-10 content-visibility-auto" id="features">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-4 block">{t.features.tag}</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">{t.features.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">{t.features.desc}</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureDetail icon={<Database />} title={t.features.cards.f1.t} desc={t.features.cards.f1.d} />
              <FeatureDetail icon={<Bell />} title={t.features.cards.f2.t} desc={t.features.cards.f2.d} />
              <FeatureDetail icon={<Siren />} title={t.features.cards.f3.t} desc={t.features.cards.f3.d} />
              <FeatureDetail icon={<Cloud />} title={t.features.cards.f4.t} desc={t.features.cards.f4.d} />
              <FeatureDetail icon={<Layout />} title={t.features.cards.f5.t} desc={t.features.cards.f5.d} />
              <FeatureDetail icon={<Users />} title={t.features.cards.f6.t} desc={t.features.cards.f6.d} />
              <FeatureDetail icon={<FileCheck />} title={t.features.cards.f7.t} desc={t.features.cards.f7.d} />
              <FeatureDetail icon={<TrendingUp />} title={t.features.cards.f8.t} desc={t.features.cards.f8.d} />
           </div>
        </div>
      </section>

      {/* Pricing Section - Content Visibility Auto */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative z-10 content-visibility-auto" id="pricing">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">{t.pricing.title}</h2>
               <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t.pricing.desc}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
               <PricingCard 
                  tier={t.pricing.p1.t}
                  price="Free"
                  period="forever"
                  desc={t.pricing.p1.d}
                  features={t.pricing.p1.f}
                  buttonText={t.pricing.p1.b}
                  action={onTryNow}
               />
               <PricingCard 
                  tier={t.pricing.p2.t}
                  price="49"
                  period="/ month"
                  desc={t.pricing.p2.d}
                  features={t.pricing.p2.f}
                  isPopular
                  buttonText={t.pricing.p2.b}
                  action={onGetStarted}
               />
               <PricingCard 
                  tier={t.pricing.p3.t}
                  price="Custom"
                  period=""
                  desc={t.pricing.p3.d}
                  features={t.pricing.p3.f}
                  buttonText={t.pricing.p3.b}
                  action={() => window.location.href = 'mailto:sales@subguard.io'}
               />
            </div>
         </div>
      </section>

      {/* Stakeholder Alignment Section */}
      <section className="py-32 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 z-10 content-visibility-auto" id="stakeholders">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4 animate-in fade-in zoom-in duration-500">
                 <Activity className="w-3 h-3" /> {t.stakeholder.tag}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                 {t.stakeholder.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">{t.stakeholder.highlight}</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg">
                 {t.stakeholder.desc}
              </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <PersonaCard 
                role={t.stakeholder.c1.r} 
                name={t.stakeholder.c1.t}
                icon={<BarChart3 />}
                id="ID-092-FN"
                quote={t.stakeholder.c1.q}
                benefits={t.stakeholder.c1.b}
                color="text-indigo-600"
                bg="bg-indigo-50"
                border="border-indigo-100"
              />
              <PersonaCard 
                role={t.stakeholder.c2.r} 
                name={t.stakeholder.c2.t}
                icon={<Lock />}
                id="ID-884-IT"
                quote={t.stakeholder.c2.q}
                benefits={t.stakeholder.c2.b}
                color="text-fuchsia-600"
                bg="bg-fuchsia-50"
                border="border-fuchsia-100"
              />
              <PersonaCard 
                role={t.stakeholder.c3.r} 
                name={t.stakeholder.c3.t}
                icon={<Radio />}
                id="ID-112-OP"
                quote={t.stakeholder.c3.q}
                benefits={t.stakeholder.c3.b}
                color="text-emerald-600"
                bg="bg-emerald-50"
                border="border-emerald-100"
              />
           </div>
        </div>
      </section>

      {/* FAQ Section - Content Visibility Auto */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative z-10 content-visibility-auto" id="faq">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-4 block">{t.faq.tag}</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-6">{t.faq.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                {t.faq.desc}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <FAQItem question={t.faq.q1.q} answer={t.faq.q1.a} />
               <FAQItem question={t.faq.q2.q} answer={t.faq.q2.a} />
               <FAQItem question={t.faq.q3.q} answer={t.faq.q3.a} />
               <FAQItem question={t.faq.q4.q} answer={t.faq.q4.a} />
               <FAQItem question={t.faq.q5.q} answer={t.faq.q5.a} />
               <FAQItem question={t.faq.q6.q} answer={t.faq.q6.a} />
               <FAQItem question={t.faq.q7.q} answer={t.faq.q7.a} />
               <FAQItem question={t.faq.q8.q} answer={t.faq.q8.a} />
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-10 content-visibility-auto" id="contact">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16">
               <div className="space-y-8">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t.contact.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{t.contact.desc}</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm"><Mail className="w-5 h-5" /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.contact.info.email}</p>
                           <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">hello@subguard.io</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm"><Phone className="w-5 h-5" /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.contact.info.phone}</p>
                           <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">+62 856-7234-922</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-rose-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm"><MapPin className="w-5 h-5" /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.contact.info.loc}</p>
                           <p className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Jakarta, Indonesia</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-500">
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch."); }}>
                     <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-indigo-600 transition-colors">{t.contact.form.n}</label>
                        <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm text-slate-900 dark:text-white transition-all focus:border-indigo-300" placeholder="Your Name" />
                     </div>
                     <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-indigo-600 transition-colors">{t.contact.form.e}</label>
                        <input type="email" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm text-slate-900 dark:text-white transition-all focus:border-indigo-300" placeholder="name@company.com" />
                     </div>
                     <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-indigo-600 transition-colors">{t.contact.form.m}</label>
                        <textarea className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm text-slate-900 dark:text-white h-32 resize-none transition-all focus:border-indigo-300" placeholder="Tell us about your requirements..."></textarea>
                     </div>
                     <button className="hover-shine w-full bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all hover:scale-[1.02] shadow-lg active:scale-95">{t.contact.form.b}</button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-slate-900 dark:bg-black relative overflow-hidden z-10" id="cta">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
            {t.cta.title} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">{t.cta.highlight}</span>
          </h2>
          <p className="text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
            {t.cta.desc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={onGetStarted} className="hover-shine bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all hover:scale-105 shadow-2xl hover:shadow-indigo-500/50">
                {t.cta.b1}
             </button>
             <button onClick={onTryNow} className="px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white border border-slate-700 hover:bg-slate-800 transition-all hover:border-slate-500">
                {t.cta.b2}
             </button>
          </div>
          <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            {t.cta.note}
          </p>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const TrustMetric = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col hover:scale-105 transition-transform cursor-default">
        <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
);

const AlertItem = ({ title, desc, type }: { title: string, desc: string, type: 'danger' | 'warning' | 'success' }) => (
    <div className={`p-4 rounded-xl border flex items-start gap-4 transform transition-all hover:scale-102 ${
        type === 'danger' ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900' : 
        type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900' : 
        'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900'
    }`}>
        <div className={`p-2 rounded-lg shadow-sm ${
             type === 'danger' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' : 
             type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 
             'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
        }`}>
            {type === 'danger' ? <XCircle className="w-4 h-4" /> : type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
        </div>
        <div>
            <h4 className={`text-xs font-black uppercase tracking-wide mb-1 ${
                type === 'danger' ? 'text-rose-700 dark:text-rose-400' : 
                type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 
                'text-emerald-700 dark:text-emerald-400'
            }`}>{title}</h4>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{desc}</p>
        </div>
    </div>
);

const ProblemCard = ({ icon, title, desc, delay }: any) => (
    <article 
      className={`bg-slate-800 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 group hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards`}
      style={{ animationDelay: `${delay}ms` }}
    >
        <div className="mb-6 bg-slate-900 dark:bg-black w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:bg-slate-950 border border-slate-800 group-hover:border-slate-700">
            {icon}
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
    </article>
);

const PersonaCard = ({ role, name, icon, id, quote, benefits, color, bg, border }: any) => {
    // Determine dynamic dark mode classes based on the input color props
    const darkBorder = border.replace('100', '800');
    const darkBg = bg.replace('50', '950/30');

    return (
        <div className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 border ${border} dark:border-slate-800 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden`}>
            
            {/* Hover Scan Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 dark:via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 z-10 pointer-events-none"></div>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color}`}></div>

            <div className="flex justify-between items-start mb-8 relative z-20">
                <div className={`w-14 h-14 rounded-2xl ${bg} dark:${darkBg} ${color} flex items-center justify-center border ${border} dark:border-slate-800 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {React.cloneElement(icon, { className: "w-7 h-7" })}
                </div>
                <div className="text-right">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${color} mb-1`}>{role}</div>
                    <div className="text-[9px] font-bold text-slate-300 dark:text-slate-600 font-mono">{id}</div>
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all">{name}</h3>
            <p className="text-sm font-medium text-slate-400 italic mb-8 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1">"{quote}"</p>

            <div className="space-y-4 relative z-20">
                {benefits.map((b: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                        <div className={`w-6 h-6 rounded-full ${bg} dark:${darkBg} flex items-center justify-center ${color} border ${border} dark:border-slate-800 group-hover/item:scale-110 transition-transform`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{b}</span>
                    </div>
                ))}
            </div>

            {/* Decorative Tech Elements */}
            <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none grayscale group-hover:opacity-10 transition-opacity duration-500 dark:invert">
                <Fingerprint className="w-24 h-24 rotate-[-15deg]" />
            </div>
        </div>
    );
};

const FeatureDetail = ({ icon, title, desc }: any) => (
    <div className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
        </div>
        
        <div className="mb-4 w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">{desc}</p>
    </div>
);

const PricingCard = ({ tier, price, period, desc, features, isPopular, buttonText, action }: any) => (
    <div className={`p-8 rounded-[2.5rem] border relative transition-all duration-500 hover:-translate-y-2 ${isPopular ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105 z-10 hover:shadow-2xl hover:shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700'}`}>
        {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">Most Popular</div>}
        <div className="mb-8">
            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isPopular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{tier}</h3>
            <div className="flex items-baseline gap-1">
                {price !== 'Custom' && <span className="text-xl font-bold align-top">$</span>}
                <span className="text-5xl font-black tracking-tighter">{price}</span>
                <span className={`text-sm font-bold ${isPopular ? 'text-slate-500' : 'text-slate-400'}`}>{period}</span>
            </div>
            <p className={`text-xs font-medium mt-4 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        </div>
        <ul className="space-y-4 mb-8">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold group">
                    <Check className={`w-4 h-4 transition-transform group-hover:scale-110 ${isPopular ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    {f}
                </li>
            ))}
        </ul>
        <button onClick={action} className={`hover-shine w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${isPopular ? 'bg-white text-slate-900 hover:bg-indigo-50' : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-500'}`}>
            {buttonText}
        </button>
    </div>
);

const FAQItem = ({ question, answer }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md group">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                <span className={`font-bold text-sm transition-colors duration-300 ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-400'}`} />
            </button>
            <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                <div className="accordion-inner px-6 pb-6 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};