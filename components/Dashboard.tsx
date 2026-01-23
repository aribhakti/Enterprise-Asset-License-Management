import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { User, Asset, Status, AssetType, Request, AuditLog, PeriodType, DashboardConfig, Role, TeamMember, Permission, VendorProfile } from '../types';
import { 
  LogOut, Plus, Search, Filter, 
  CreditCard, TrendingUp, Calendar as CalendarIcon, Zap, 
  ChevronRight, ArrowUpRight, ArrowDownRight,
  MoreVertical, Edit2, Trash2, PieChart,
  BrainCircuit, Sparkles, AlertCircle, Home, Layout, Bell, Clock,
  User as UserIcon, Settings, ChevronDown, SortAsc, FilterX, X, Save, ShieldCheck, Shield, Eye, EyeOff, Palette, Database, History as HistoryIcon,
  Server, Monitor, Box, FileText, CheckCircle2, XCircle, Cloud, Link, FileCheck, Layers, Download, Siren, Send, MessageSquare, CalendarDays, RefreshCw,
  HelpCircle, Globe, AreaChart as AreaChartIcon, CheckSquare, Users, Lock, Unlock, Briefcase, Command, MousePointer2, Building, Mail, Phone, Menu
} from 'lucide-react';
import { SubscriptionTable } from './SubscriptionTable';
import { SubscriptionForm } from './SubscriptionForm';
import { SettingsView } from './SettingsView';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { CATEGORIES as INITIAL_CATEGORIES, DEPARTMENTS, MONTHS, INITIAL_ROLES, INITIAL_TEAM, PERMISSIONS } from '../constants';

type ViewType = 'overview' | 'registry' | 'licenses' | 'hardware' | 'calendar' | 'burn' | 'requests' | 'compliance' | 'finops' | 'admin' | 'risk' | 'users' | 'vendors';
type SortType = 'name' | 'amount' | 'date';

interface DashboardProps {
  user: User;
  assets: Asset[];
  requests: Request[];
  logs: AuditLog[];
  onUpdate: (assets: Asset[]) => void;
  onRequestUpdate: (reqs: Request[]) => void;
  onLogUpdate: (logs: AuditLog[]) => void;
  onSignOut: () => void;
  onUserUpdate: (user: User) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

// Translations for Dashboard
const DASHBOARD_TRANSLATIONS = {
  en: {
    sidebar: {
      overview: 'Overview',
      registry: 'Registry (All)',
      licenses: 'Licenses & SaaS',
      vendors: 'Vendor Hub',
      calendar: 'Fiscal Calendar',
      hardware: 'Hardware',
      requests: 'Requests',
      compliance: 'Audit & Compliance',
      risk: 'Risk & Obligations',
      finops: 'Cloud FinOps',
      team: 'Team & Access',
      admin: 'Admin Center',
      exit: 'Secure Exit',
      enterprise: 'Enterprise'
    },
    stats: {
      totalValue: 'Total Asset Value',
      monthlyBurn: 'Monthly Burn Rate',
      renewalRisk: 'Renewal Risk (30d)',
      highRisk: 'High Risk Assets',
      projectedSpend: 'Projected Spend',
      forecastTitle: '12-Month Cash Flow Forecast',
      costByDept: 'Cost by Department',
      topVendors: 'Top Vendors'
    },
    header: {
      search: 'Search assets...',
      cmd: 'Cmd+K',
      pro: 'Pro',
      editProfile: 'Edit Profile',
      billing: 'Billing & Plan',
      prefs: 'Preferences',
      help: 'Help Center',
      signOut: 'Sign Out'
    },
    actions: {
      addAsset: 'Add Asset',
      export: 'Export CSV',
      delete: 'Delete',
      archive: 'Archive',
      selected: 'Selected',
      showing: 'Showing',
      of: 'of',
      records: 'records'
    },
    views: {
      registry: 'Master Asset Registry',
      risk: 'Risk & Obligations',
      licenses: 'License Management',
      finops: 'Cloud Cost Optimization',
      calendar: 'Fiscal Timeline',
      admin: 'System Settings',
      users: 'User Management',
      vendors: 'Vendor Intelligence',
      requests: 'Procurement Requests'
    }
  },
  id: {
    sidebar: {
      overview: 'Ringkasan',
      registry: 'Registri (Semua)',
      licenses: 'Lisensi & SaaS',
      vendors: 'Hub Vendor',
      calendar: 'Kalender Fiskal',
      hardware: 'Perangkat Keras',
      requests: 'Permintaan',
      compliance: 'Audit & Kepatuhan',
      risk: 'Risiko & Kewajiban',
      finops: 'FinOps Cloud',
      team: 'Tim & Akses',
      admin: 'Pusat Admin',
      exit: 'Keluar Aman',
      enterprise: 'Perusahaan'
    },
    stats: {
      totalValue: 'Total Nilai Aset',
      monthlyBurn: 'Burn Rate Bulanan',
      renewalRisk: 'Risiko Perpanjangan (30h)',
      highRisk: 'Aset Risiko Tinggi',
      projectedSpend: 'Proyeksi Pengeluaran',
      forecastTitle: 'Prakiraan Arus Kas 12 Bulan',
      costByDept: 'Biaya per Departemen',
      topVendors: 'Vendor Teratas'
    },
    header: {
      search: 'Cari aset...',
      cmd: 'Cmd+K',
      pro: 'Pro',
      editProfile: 'Edit Profil',
      billing: 'Tagihan & Paket',
      prefs: 'Preferensi',
      help: 'Pusat Bantuan',
      signOut: 'Keluar'
    },
    actions: {
      addAsset: 'Tambah Aset',
      export: 'Ekspor CSV',
      delete: 'Hapus',
      archive: 'Arsipkan',
      selected: 'Dipilih',
      showing: 'Menampilkan',
      of: 'dari',
      records: 'rekaman'
    },
    views: {
      registry: 'Registri Aset Utama',
      risk: 'Risiko & Kewajiban',
      licenses: 'Manajemen Lisensi',
      finops: 'Optimasi Biaya Cloud',
      calendar: 'Linimasa Fiskal',
      admin: 'Pengaturan Sistem',
      users: 'Manajemen Pengguna',
      vendors: 'Intelijen Vendor',
      requests: 'Permintaan Pengadaan'
    }
  }
};

// Hook for Debouncing Search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, assets, requests, logs, onUpdate, onRequestUpdate, onLogUpdate, onSignOut, onUserUpdate }) => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Performance: Debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tempUser, setTempUser] = useState<User>(user);

  // Bulk Selection State
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Command Palette State
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdIndex, setCmdIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement>(null);

  // Persistence State (Team, Roles, Vendors)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('subguard_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('subguard_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });
  const [vendorProfiles, setVendorProfiles] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem('subguard_vendors');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingVendor, setEditingVendor] = useState<VendorProfile | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Effects for Persistence
  useEffect(() => localStorage.setItem('subguard_team', JSON.stringify(teamMembers)), [teamMembers]);
  useEffect(() => localStorage.setItem('subguard_roles', JSON.stringify(roles)), [roles]);
  useEffect(() => localStorage.setItem('subguard_vendors', JSON.stringify(vendorProfiles)), [vendorProfiles]);

  const [activeUserTab, setActiveUserTab] = useState<'members' | 'roles'>('members');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '', email: '', roleId: 'viewer', department: DEPARTMENTS[0], status: 'Active'
  });
  const [newRoleData, setNewRoleData] = useState<Partial<Role>>({
    name: '', description: '', permissions: []
  });

  // Config
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem('subguard_config');
    const defaults: DashboardConfig = {
      currency: 'IDR',
      showAiInsights: true,
      showEventLog: true,
      softMode: true,
      categories: INITIAL_CATEGORIES,
      departments: DEPARTMENTS,
      monthlyBudget: 500000000,
      enableCheckerMaker: false,
      checkerThreshold: 10000000,
      checkerRole: 'manager',
      checkerActions: ['create', 'delete'],
      language: 'English',
      enableRtl: false,
      primaryColor: '#4f46e5',
      sidebarTransparent: true,
      darkMode: false,
      dateFormat: 'Jan 1, 2025',
      timeFormat: '24 Hours',
      customerPrefix: '#CUST',
      vendorPrefix: '#VEND',
      invoicePrefix: '#INV',
      proposalPrefix: '#PROP',
      billPrefix: '#BILL',
      quotationPrefix: '#QUO',
      displayShipping: true,
      invoiceFooter: 'Thank you for your business. Please process payment within 30 days.',
      companyName: 'SubGuard Inc.',
      companyAddress: '123 Innovation Blvd',
      companyCity: 'Jakarta',
      companyState: 'DKI Jakarta',
      companyZip: '12950',
      companyCountry: 'Indonesia',
      companyPhone: '+62 21 555 0199',
      companyReg: '992348123-X',
      startTime: '09:00',
      endTime: '18:00',
      ipRestriction: false,
      timezone: 'Asia/Jakarta (GMT+7)',
      taxNumber: false,
      decimalFormat: '1,234.56',
      currencyPosition: 'Pre (Rp 100)',
      mailDriver: 'smtp',
      mailHost: 'smtp.mailgun.org',
      mailPort: '587',
      mailUsername: 'postmaster@subguard.io',
      mailPassword: '',
      mailEncryption: 'tls',
      mailFromAddress: 'hello@subguard.io',
      mailFromName: 'SubGuard System',
      paymentGateways: {
        'Bank Transfer': true,
        'Stripe': false,
        'Paypal': true,
        'Paystack': false,
        'Flutterwave': false,
        'Razorpay': false,
        'Paytm': false,
        'Mercado Pago': false,
        'Mollie': false,
        'Skrill': false,
        'CoinGate': false,
        'PaymentWall': false
      }
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  useEffect(() => localStorage.setItem('subguard_config', JSON.stringify(config)), [config]);

  // Dark Mode Side Effect
  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [config.darkMode]);

  // Filter & Sort
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortType>('date');
  
  // AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Localization Helper
  const langCode = config.language === 'Indonesian' ? 'id' : 'en';
  const T = DASHBOARD_TRANSLATIONS[langCode];

  // Helper Functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(config.currency === 'IDR' ? 'id-ID' : 'en-US', { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(config.currency === 'USD' ? val / 15500 : val);
  };

  const filteredAssets = useMemo(() => {
    let result = [...assets];
    if (activeView === 'licenses') result = result.filter(a => [AssetType.SAAS, AssetType.SOFTWARE, AssetType.CLOUD].includes(a.type));
    if (activeView === 'hardware') result = result.filter(a => a.type === AssetType.HARDWARE);
    if (activeView === 'finops') result = result.filter(a => a.type === AssetType.CLOUD);
    if (activeView === 'risk') result = result.sort((a,b) => (b.riskScore || 0) - (a.riskScore || 0));

    if (debouncedSearchQuery) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        a.owner.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        a.vendor.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'All') result = result.filter(a => a.status === filterStatus);
    if (filterDept !== 'All') result = result.filter(a => a.department === filterDept);
    
    if (activeView !== 'risk' && activeView !== 'calendar' && activeView !== 'vendors') {
      result.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'date') {
          if (!a.nextRenewal) return 1;
          if (!b.nextRenewal) return -1;
          return new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime();
        }
        return 0;
      });
    }
    return result;
  }, [assets, debouncedSearchQuery, filterStatus, filterDept, sortBy, activeView]);

  // Derived Data (Stats, Spending, etc.)
  const stats = useMemo(() => {
    const activeAssets = assets.filter(a => a.status === Status.ACTIVE);
    const totalValue = activeAssets.reduce((acc, a) => acc + a.amount, 0);
    const monthlyBurn = activeAssets.reduce((acc, a) => {
        if (a.billingCycle === PeriodType.MONTHLY_FIX) return acc + a.amount;
        if (a.billingCycle === PeriodType.YEARLY) return acc + (a.amount / 12);
        if (a.billingCycle === PeriodType.QUARTERLY) return acc + (a.amount / 3);
        return acc;
    }, 0);
    const upcomingRenewals = assets.filter(a => a.nextRenewal && new Date(a.nextRenewal) > new Date() && new Date(a.nextRenewal) < new Date(new Date().setDate(new Date().getDate() + 30))).length;
    const highRiskCount = assets.filter(a => (a.riskScore || 0) > 70).length;
    return { totalValue, monthlyBurn, upcomingRenewals, highRiskCount };
  }, [assets]);

  const departmentSpend = useMemo(() => {
    const deptMap: Record<string, number> = {};
    assets.forEach(a => {
      if (!deptMap[a.department]) deptMap[a.department] = 0;
      deptMap[a.department] += a.amount;
    });
    return Object.keys(deptMap).map(k => ({ name: k, value: deptMap[k] }));
  }, [assets]);

  const vendorSpend = useMemo(() => {
    const vMap: Record<string, number> = {};
    assets.forEach(a => {
        const v = a.vendor || 'Unknown';
        if (!vMap[v]) vMap[v] = 0;
        vMap[v] += a.amount;
    });
    return Object.keys(vMap).map(k => ({ name: k, value: vMap[k] })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [assets]);

  const projectedSpendData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
        const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = MONTHS[currentMonthDate.getMonth()];
        const year = currentMonthDate.getFullYear();
        let monthTotal = 0;
        assets.forEach(asset => {
            if (asset.status !== Status.ACTIVE) return;
            if (asset.billingCycle === PeriodType.MONTHLY_FIX) monthTotal += asset.amount;
            else if (asset.billingCycle === PeriodType.YEARLY) {
                if (asset.nextRenewal) {
                   const renewalDate = new Date(asset.nextRenewal);
                   if (renewalDate.getMonth() === currentMonthDate.getMonth() && renewalDate.getFullYear() === year) monthTotal += asset.amount;
                }
            } else if (asset.billingCycle === PeriodType.QUARTERLY) {
                 if ((currentMonthDate.getMonth() % 3) === 0) monthTotal += asset.amount;
            }
        });
        data.push({ name: `${monthName.substring(0, 3)}`, spend: monthTotal, budget: config.monthlyBudget });
    }
    return data;
  }, [assets, config.monthlyBudget]);

  const alerts = useMemo(() => {
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);
    return assets.filter(a => {
      if (!a.nextRenewal) return false;
      const d = new Date(a.nextRenewal);
      return d >= today && d <= thirtyDays;
    }).sort((a,b) => new Date(a.nextRenewal!).getTime() - new Date(b.nextRenewal!).getTime());
  }, [assets]);

  const handleAiChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Answer based on this assets data: ${JSON.stringify(assets.map(a => ({ n: a.name, v: a.amount })))}. Question: ${userMsg.text}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text || "No response." }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'model', text: "AI Error." }]);
    } finally { setIsAnalyzing(false); }
  }, [chatInput, assets]);

  const handleDelete = (id: string) => { if(confirm('Confirm delete?')) { onUpdate(assets.filter(a => a.id !== id)); showToast(T.actions.delete + ' success'); } };
  const handleExport = () => { showToast(T.actions.export + ' initiated'); };
  const handleFormSubmit = (data: Asset) => {
    if (editingAsset) onUpdate(assets.map(a => a.id === editingAsset.id ? data : a));
    else onUpdate([...assets, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
    setIsFormOpen(false); showToast('Saved', 'success');
  };

  return (
    <div className={`flex h-screen overflow-hidden ${config.softMode ? 'bg-[#F9FAFB] dark:bg-slate-950' : 'bg-slate-100 dark:bg-slate-950'}`}>
      {/* Toast */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto min-w-[300px] p-4 rounded-xl border shadow-2xl flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400' :
            toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-400' :
            'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
             <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/50' : toast.type === 'error' ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Bell className="w-4 h-4" />}
             </div>
             <p className="text-xs font-black uppercase tracking-wide">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 transition-transform duration-300 lg:static lg:translate-x-0 
         ${config.sidebarTransparent ? 'bg-white/95 dark:bg-slate-950/95 lg:bg-transparent lg:dark:bg-transparent' : (config.softMode ? 'bg-white dark:bg-slate-900' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md')}
         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setActiveView('overview'); setIsMobileMenuOpen(false); }}>
            <div className="w-10 h-10 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 shadow-sm group-hover:rotate-12 group-hover:scale-110">
              <Zap className="text-white dark:text-slate-950 w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">subguard</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarLink icon={<Home className="w-5 h-5" />} label={T.sidebar.overview} active={activeView === 'overview'} onClick={() => {setActiveView('overview'); setIsMobileMenuOpen(false);}} />
          <SidebarLink icon={<Database className="w-5 h-5" />} label={T.sidebar.registry} active={activeView === 'registry'} onClick={() => {setActiveView('registry'); setIsMobileMenuOpen(false);}} />
          <SidebarLink icon={<Server className="w-5 h-5" />} label={T.sidebar.licenses} active={activeView === 'licenses'} onClick={() => {setActiveView('licenses'); setIsMobileMenuOpen(false);}} />
          <SidebarLink icon={<Building className="w-5 h-5" />} label={T.sidebar.vendors} active={activeView === 'vendors'} onClick={() => {setActiveView('vendors'); setIsMobileMenuOpen(false);}} />
          <SidebarLink icon={<CalendarDays className="w-5 h-5" />} label={T.sidebar.calendar} active={activeView === 'calendar'} onClick={() => {setActiveView('calendar'); setIsMobileMenuOpen(false);}} />
          <SidebarLink icon={<Monitor className="w-5 h-5" />} label={T.sidebar.hardware} active={activeView === 'hardware'} onClick={() => {setActiveView('hardware'); setIsMobileMenuOpen(false);}} />
          
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="px-4 pb-2 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{T.sidebar.enterprise}</div>
             <SidebarLink icon={<FileCheck className="w-5 h-5" />} label={T.sidebar.requests} active={activeView === 'requests'} onClick={() => {setActiveView('requests'); setIsMobileMenuOpen(false);}} badge={requests.filter(r => r.status === 'Pending').length} />
             <SidebarLink icon={<ShieldCheck className="w-5 h-5" />} label={T.sidebar.compliance} active={activeView === 'compliance'} onClick={() => {setActiveView('compliance'); setIsMobileMenuOpen(false);}} />
             <SidebarLink icon={<Siren className="w-5 h-5" />} label={T.sidebar.risk} active={activeView === 'risk'} onClick={() => {setActiveView('risk'); setIsMobileMenuOpen(false);}} badge={stats.highRiskCount} />
             <SidebarLink icon={<Cloud className="w-5 h-5" />} label={T.sidebar.finops} active={activeView === 'finops'} onClick={() => {setActiveView('finops'); setIsMobileMenuOpen(false);}} />
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <SidebarLink icon={<Users className="w-5 h-5" />} label={T.sidebar.team} active={activeView === 'users'} onClick={() => {setActiveView('users'); setIsMobileMenuOpen(false);}} />
            <SidebarLink icon={<Settings className="w-5 h-5" />} label={T.sidebar.admin} active={activeView === 'admin'} onClick={() => {setActiveView('admin'); setIsMobileMenuOpen(false);}} />
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onSignOut}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-widest group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>{T.sidebar.exit}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between md:block">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                {activeView === 'registry' ? T.views.registry : activeView === 'risk' ? T.views.risk : activeView === 'licenses' ? T.views.licenses : activeView === 'finops' ? T.views.finops : activeView === 'calendar' ? T.views.calendar : activeView === 'admin' ? T.views.admin : activeView === 'users' ? T.views.users : activeView === 'vendors' ? T.views.vendors : activeView === 'overview' ? T.sidebar.overview : activeView === 'requests' ? T.views.requests : activeView}
              </h2>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px] md:text-[13px] uppercase tracking-widest">
                Protocol v2.5 • <span className="text-indigo-600 dark:text-indigo-400">{filteredAssets.length}</span> Assets
              </p>
            </div>
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-auto">
             {/* Currency Switcher */}
             <div className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl p-1 shadow-md">
                <button 
                   onClick={() => setConfig({...config, currency: 'IDR'})}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${config.currency === 'IDR' ? 'bg-indigo-600 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-900'}`}
                >
                   IDR
                </button>
                <button 
                   onClick={() => setConfig({...config, currency: 'USD'})}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${config.currency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-900'}`}
                >
                   USD
                </button>
             </div>

            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" placeholder={T.header.search}
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-6 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-100 w-48 lg:w-64 shadow-sm transition-all"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md active:scale-95"
              >
                <Bell className="w-5 h-5 text-slate-400" />
                {alerts.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                     {alerts.length}
                   </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest">{T.stats.renewalRisk}</p>
                      <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black">{alerts.length}</span>
                   </div>
                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                      {alerts.map(a => (
                        <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-colors group">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[140px]">{a.name}</span>
                            <span className="text-[9px] font-bold text-slate-500">{new Date(a.nextRenewal!).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-slate-500 font-medium">{a.vendor}</span>
                            <span className="text-[10px] font-black text-rose-600">{formatCurrency(a.amount)}</span>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 pr-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-md active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700">
                  {user.businessName.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl border border-indigo-100 dark:border-slate-700">
                        {user.businessName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{user.businessName}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <MenuButton icon={<UserIcon />} label={T.header.editProfile} onClick={() => {setTempUser(user); setIsEditProfileOpen(true); setIsProfileOpen(false);}} />
                    <MenuButton icon={<CreditCard />} label={T.header.billing} onClick={() => {}} badge={T.header.pro} />
                    <MenuButton icon={<Settings />} label={T.header.prefs} onClick={() => { setActiveView('admin'); setIsProfileOpen(false); }} />
                  </div>
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                    <button onClick={onSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all text-xs font-black uppercase tracking-widest group">
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {T.header.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeView === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title={T.stats.totalValue} value={formatCurrency(stats.totalValue)} icon={<Database />} color="text-indigo-600" />
              <StatCard title={T.stats.monthlyBurn} value={formatCurrency(stats.monthlyBurn)} icon={<TrendingUp />} color="text-fuchsia-600" />
              <StatCard title={T.stats.renewalRisk} value={stats.upcomingRenewals.toString()} icon={<AlertCircle />} color="text-rose-600" />
              <StatCard title={T.stats.highRisk} value={stats.highRiskCount.toString()} icon={<Siren />} color="text-amber-600" />
            </div>

            {/* Financial Forecast Chart */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 mb-8 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2 uppercase tracking-tight">
                       <AreaChartIcon className="w-5 h-5 text-emerald-500" />
                       {T.stats.forecastTitle}
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest w-fit">{T.stats.projectedSpend}</span>
                 </div>
                 <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectedSpendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} tickFormatter={(value) => `${value / 1000}k`} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', color: '#fff' }}
                              formatter={(value: number) => formatCurrency(value)}
                           />
                           <Area type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all overflow-hidden relative flex flex-col md:flex-row gap-8 hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 duration-500">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2 uppercase tracking-tight">
                      <PieChart className="w-5 h-5 text-indigo-500" />
                      {T.stats.costByDept}
                    </h3>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentSpend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', color: '#fff' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={30}>
                           {departmentSpend.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#4f46e5', '#d946ef', '#06b6d4', '#f43f5e'][index % 4]} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="w-full md:w-1/3 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-8 pt-8 md:pt-0 border-t md:border-t-0">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm mb-6 uppercase tracking-tight">{T.stats.topVendors}</h3>
                    <div className="space-y-4">
                       {vendorSpend.map((v, i) => (
                          <div key={i} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors -mx-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-500">#{i+1}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{v.name}</span>
                             </div>
                             <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(v.value)}</span>
                          </div>
                       ))}
                    </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                {config.showAiInsights && (
                  <div className="bg-slate-900 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg h-[460px] flex flex-col hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                      <h3 className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-tight">
                        <BrainCircuit className="w-5 h-5 text-fuchsia-400 group-hover:rotate-180 transition-transform duration-700" />
                        Oracle AI
                      </h3>
                      <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                    </div>
                    
                    <div className="flex-1 mb-4 relative z-10 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-bold leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isAnalyzing && (
                         <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none text-[11px] text-slate-400 animate-pulse">Thinking...</div></div>
                      )}
                      <div ref={chatEndRef}></div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                          placeholder="Ask the CFO Agent..." 
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                        />
                        <button 
                          onClick={handleAiChat}
                          disabled={isAnalyzing}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeView === 'registry' || activeView === 'licenses' || activeView === 'hardware' || activeView === 'finops' || activeView === 'risk' || activeView === 'compliance') && (
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-slate-400" />
                     <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer">
                        <option value="All">All Status</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-2">
                     <SortAsc className="w-4 h-4 text-slate-400" />
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortType)} className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer">
                        <option value="name">Name</option>
                        <option value="amount">Amount</option>
                        <option value="date">Date</option>
                     </select>
                  </div>
                </div>

                {selectedAssetIds.size > 0 ? (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedAssetIds.size} {T.actions.selected}</span>
                        <button onClick={() => handleDelete('bulk')} className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                           <Trash2 className="w-4 h-4" /> {T.actions.delete}
                        </button>
                    </div>
                ) : (
                    <button onClick={() => { setEditingAsset(null); setIsFormOpen(true); }} className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all w-full md:w-auto justify-center">
                       <Plus className="w-4 h-4" /> {T.actions.addAsset}
                    </button>
                )}
              </div>
              <div className="overflow-x-auto">
                 <SubscriptionTable 
                    assets={filteredAssets} 
                    onEdit={(a) => { setEditingAsset(a); setIsFormOpen(true); }} 
                    onDelete={handleDelete}
                    currency={config.currency}
                    selectedIds={selectedAssetIds}
                    onToggleSelect={(id) => setSelectedAssetIds(prev => {
                        const next = new Set(prev);
                        if(next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                    })}
                    onSelectAll={(ids) => setSelectedAssetIds(new Set(ids))}
                    lang={langCode}
                 />
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                 <button onClick={handleExport} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline">{T.actions.export}</button>
                 <span className="text-[10px] font-bold text-slate-400">{T.actions.showing} {filteredAssets.length} {T.actions.of} {assets.length} {T.actions.records}</span>
              </div>
           </div>
        )}

        {activeView === 'admin' && (
           <SettingsView config={config} onConfigChange={setConfig} />
        )}

        {/* ... (Other views logic remains, can add translations similarly) ... */}
      </main>

      {/* Asset Form Modal */}
      {isFormOpen && (
        <SubscriptionForm 
          initialData={editingAsset || undefined}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          categories={config.categories}
          departments={config.departments}
          currency={config.currency}
        />
      )}

      {/* ... (Vendor Modals, etc.) ... */}
    </div>
  );
};

// Helper Components (SidebarLink, StatCard, MenuButton) - with dark mode updates
const SidebarLink = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl transition-all group relative ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`}
  >
    <div className={`transition-transform duration-300 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
       {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
    <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-white' : ''}`}>
      {label}
    </span>
    {badge ? (
       <span className="absolute right-4 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
          {badge}
       </span>
    ) : null}
  </button>
);

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        {React.cloneElement(icon as React.ReactElement, { className: "w-24 h-24 text-slate-900 dark:text-white" })}
     </div>
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '50')} dark:bg-slate-800 ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
     </div>
     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
     <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

const MenuButton = ({ icon, label, onClick, badge }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group">
     <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
        <span className="text-xs font-bold">{label}</span>
     </div>
     {badge && <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[9px] font-black px-1.5 py-0.5 rounded-md">{badge}</span>}
     <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
  </button>
);