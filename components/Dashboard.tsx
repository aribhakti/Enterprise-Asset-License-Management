
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Asset, Status, AssetType, Request, AuditLog, PeriodType, DashboardConfig, Role, TeamMember, Permission, VendorProfile } from '../types';
import { 
  LogOut, Plus, Search, Filter, 
  CreditCard, TrendingUp, Calendar as CalendarIcon, Zap, 
  ChevronRight, ArrowUpRight, ArrowDownRight,
  MoreVertical, Edit2, Trash2, PieChart,
  BrainCircuit, Sparkles, AlertCircle, Home, Layout, Bell, Clock,
  User as UserIcon, Settings, ChevronDown, SortAsc, FilterX, X, Save, ShieldCheck, Shield, Eye, EyeOff, Palette, Database, History as HistoryIcon,
  Server, Monitor, Box, FileText, CheckCircle2, XCircle, Cloud, Link, FileCheck, Layers, Download, Siren, Send, MessageSquare, CalendarDays, RefreshCw,
  HelpCircle, Globe, AreaChart as AreaChartIcon, CheckSquare, Users, Lock, Unlock, Briefcase, Command, MousePointer2, Building, Mail, Phone
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

export const Dashboard: React.FC<DashboardProps> = ({ user, assets, requests, logs, onUpdate, onRequestUpdate, onLogUpdate, onSignOut, onUserUpdate }) => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile & UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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

  // User Management State with Persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('subguard_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('subguard_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  // Vendor State
  const [vendorProfiles, setVendorProfiles] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem('subguard_vendors');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingVendor, setEditingVendor] = useState<VendorProfile | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('subguard_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('subguard_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('subguard_vendors', JSON.stringify(vendorProfiles));
  }, [vendorProfiles]);

  const [activeUserTab, setActiveUserTab] = useState<'members' | 'roles'>('members');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // New User/Role Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '', email: '', roleId: 'viewer', department: DEPARTMENTS[0], status: 'Active'
  });
  const [newRoleData, setNewRoleData] = useState<Partial<Role>>({
    name: '', description: '', permissions: []
  });

  // Dashboard Configuration
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

  useEffect(() => {
    localStorage.setItem('subguard_config', JSON.stringify(config));
  }, [config]);

  // Apply visual settings side-effects
  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [config.darkMode]);

  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortType>('date');
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Command Palette Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
        setCmdQuery('');
        setCmdIndex(0);
      }
      if (e.key === 'Escape') {
        setIsCmdOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCmdOpen && cmdInputRef.current) {
      setTimeout(() => cmdInputRef.current?.focus(), 50);
    }
  }, [isCmdOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-overview', label: 'Go to Overview', group: 'Navigation', icon: <Home className="w-4 h-4" />, action: () => setActiveView('overview') },
    { id: 'nav-registry', label: 'Go to Registry', group: 'Navigation', icon: <Database className="w-4 h-4" />, action: () => setActiveView('registry') },
    { id: 'nav-vendors', label: 'Vendor Intelligence Hub', group: 'Navigation', icon: <Building className="w-4 h-4" />, action: () => setActiveView('vendors') },
    { id: 'nav-calendar', label: 'Go to Fiscal Calendar', group: 'Navigation', icon: <CalendarDays className="w-4 h-4" />, action: () => setActiveView('calendar') },
    { id: 'nav-requests', label: 'View Requests', group: 'Navigation', icon: <FileCheck className="w-4 h-4" />, action: () => setActiveView('requests') },
    { id: 'nav-users', label: 'User Management', group: 'Navigation', icon: <Users className="w-4 h-4" />, action: () => setActiveView('users') },
    { id: 'nav-settings', label: 'Settings & Admin', group: 'Navigation', icon: <Settings className="w-4 h-4" />, action: () => setActiveView('admin') },
    
    // Actions
    { id: 'act-add', label: 'Add New Asset', group: 'Actions', icon: <Plus className="w-4 h-4" />, action: () => { setEditingAsset(null); setIsFormOpen(true); } },
    { id: 'act-export', label: 'Export Data CSV', group: 'Actions', icon: <Download className="w-4 h-4" />, action: () => handleExport() },
    { id: 'act-add-user', label: 'Invite Team Member', group: 'Actions', icon: <UserIcon className="w-4 h-4" />, action: () => { setActiveView('users'); setIsUserModalOpen(true); } },
    
    // Preferences
    { id: 'pref-theme', label: `Switch to ${config.darkMode ? 'Light' : 'Dark'} Mode`, group: 'Preferences', icon: config.darkMode ? <Zap className="w-4 h-4" /> : <Monitor className="w-4 h-4" />, action: () => setConfig(prev => ({...prev, darkMode: !prev.darkMode})) },
    { id: 'pref-currency', label: `Switch Currency to ${config.currency === 'IDR' ? 'USD' : 'IDR'}`, group: 'Preferences', icon: <CreditCard className="w-4 h-4" />, action: () => setConfig(prev => ({...prev, currency: prev.currency === 'IDR' ? 'USD' : 'IDR'})) },
  ], [config.darkMode, config.currency]);

  const filteredCommands = useMemo(() => {
    return commands.filter(c => c.label.toLowerCase().includes(cmdQuery.toLowerCase()));
  }, [commands, cmdQuery]);

  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!isCmdOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCmdIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCmdIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[cmdIndex]) {
           filteredCommands[cmdIndex].action();
           setIsCmdOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isCmdOpen, filteredCommands, cmdIndex]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const stats = useMemo(() => {
    const activeAssets = assets.filter(a => a.status === Status.ACTIVE);
    const totalValue = activeAssets.reduce((acc, a) => acc + a.amount, 0);
    
    // Calculate Monthly Burn Rate (Amortized)
    const monthlyBurn = activeAssets.reduce((acc, a) => {
        if (a.billingCycle === PeriodType.MONTHLY_FIX) return acc + a.amount;
        if (a.billingCycle === PeriodType.YEARLY) return acc + (a.amount / 12);
        if (a.billingCycle === PeriodType.QUARTERLY) return acc + (a.amount / 3);
        return acc;
    }, 0);

    const licenseSpend = activeAssets.filter(a => [AssetType.SAAS, AssetType.SOFTWARE, AssetType.CLOUD].includes(a.type)).reduce((acc, a) => acc + a.amount, 0);
    const hardwareCount = activeAssets.filter(a => a.type === AssetType.HARDWARE).length;
    const upcomingRenewals = assets.filter(a => a.nextRenewal && new Date(a.nextRenewal) > new Date() && new Date(a.nextRenewal) < new Date(new Date().setDate(new Date().getDate() + 30))).length;
    const wastePotential = assets.filter(a => (a.utilization || 0) < 50).reduce((acc, a) => acc + a.amount, 0);
    const highRiskCount = assets.filter(a => (a.riskScore || 0) > 70).length;
    
    return { totalValue, monthlyBurn, licenseSpend, hardwareCount, upcomingRenewals, wastePotential, highRiskCount };
  }, [assets]);

  // Calculate Projected Spend for the next 12 months
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

            if (asset.billingCycle === PeriodType.MONTHLY_FIX) {
                monthTotal += asset.amount;
            } else if (asset.billingCycle === PeriodType.YEARLY) {
                if (asset.nextRenewal) {
                   const renewalDate = new Date(asset.nextRenewal);
                   // If renewal is in this specific month/year
                   if (renewalDate.getMonth() === currentMonthDate.getMonth() && renewalDate.getFullYear() === year) {
                       monthTotal += asset.amount;
                   }
                }
            } else if (asset.billingCycle === PeriodType.QUARTERLY) {
                 // Simplified quarterly logic for demo
                 if ((currentMonthDate.getMonth() % 3) === 0) {
                     monthTotal += asset.amount;
                 }
            }
        });

        data.push({
            name: `${monthName.substring(0, 3)}`,
            spend: monthTotal,
            budget: config.monthlyBudget // Use budget from config
        });
    }
    return data;
  }, [assets, config.monthlyBudget]);


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
       if (!vMap[a.vendor]) vMap[a.vendor] = 0;
       vMap[a.vendor] += a.amount;
    });
    return Object.entries(vMap)
       .sort(([,a], [,b]) => b - a)
       .slice(0, 5)
       .map(([k,v]) => ({ name: k, value: v }));
  }, [assets]);

  // Aggregated Vendors for Hub View
  const uniqueVendors = useMemo(() => {
    const vMap: Record<string, { spend: number, count: number, assets: Asset[], profile?: VendorProfile }> = {};
    assets.forEach(a => {
        if(!a.vendor) return;
        if (!vMap[a.vendor]) {
            vMap[a.vendor] = { 
                spend: 0, 
                count: 0, 
                assets: [],
                profile: vendorProfiles.find(p => p.name === a.vendor)
            };
        }
        vMap[a.vendor].spend += a.amount;
        vMap[a.vendor].count++;
        vMap[a.vendor].assets.push(a);
    });
    return Object.entries(vMap)
       .map(([name, data]) => ({ name, ...data }))
       .sort((a,b) => b.spend - a.spend);
  }, [assets, vendorProfiles]);

  // Upcoming renewals for notifications
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

  const filteredAssets = useMemo(() => {
    let result = [...assets];
    
    // View based filtering
    if (activeView === 'licenses') result = result.filter(a => [AssetType.SAAS, AssetType.SOFTWARE, AssetType.CLOUD].includes(a.type));
    if (activeView === 'hardware') result = result.filter(a => a.type === AssetType.HARDWARE);
    if (activeView === 'finops') result = result.filter(a => a.type === AssetType.CLOUD);
    if (activeView === 'risk') result = result.sort((a,b) => (b.riskScore || 0) - (a.riskScore || 0));

    // Search & Manual Filters
    if (searchQuery) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'All') result = result.filter(a => a.status === filterStatus);
    if (filterDept !== 'All') result = result.filter(a => a.department === filterDept);
    
    // Default sorting if not risk view
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
  }, [assets, searchQuery, filterStatus, filterDept, sortBy, activeView]);

  const handleAiChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contextData = JSON.stringify(assets.map(s => ({ 
        name: s.name, 
        amount: s.amount, 
        type: s.type, 
        department: s.department, 
        utilization: s.utilization, 
        vendor: s.vendor, 
        renewal: s.nextRenewal 
      })));

      const prompt = `You are SubGuard's AI CFO Assistant. Answer the user's question based on this asset data: ${contextData}.
      User Question: "${userMsg.text}"
      Keep the answer concise (max 3 sentences), financial, and actionable. If calculating totals, be precise.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const botMsg: ChatMessage = { role: 'model', text: response.text || "I couldn't process that data." };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Connection to Neural Core failed. Try again." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestAction = (id: string, action: 'Approved' | 'Rejected') => {
    const updated = requests.map(r => r.id === id ? { ...r, status: action } : r);
    onRequestUpdate(updated);
    
    const req = requests.find(r => r.id === id);
    if(req) {
      const log: AuditLog = {
        id: Math.random().toString(36),
        action: `Request ${action}`,
        actor: user.businessName,
        target: req.item,
        timestamp: new Date().toISOString(),
        details: `${action} request for ${req.item} (${formatCurrency(req.cost)})`
      };
      onLogUpdate([log, ...logs]);
      showToast(`Request ${action} successfully`, action === 'Approved' ? 'success' : 'info');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Decommission asset? This action is irreversible.')) {
      onUpdate(assets.filter(a => a.id !== id));
      setSelectedAssetIds(prev => {
         const next = new Set(prev);
         next.delete(id);
         return next;
      });
      showToast('Asset decommissioned successfully', 'success');
    }
  };

  const handleBulkDelete = () => {
     if(selectedAssetIds.size === 0) return;
     if(confirm(`Are you sure you want to decommission ${selectedAssetIds.size} assets?`)) {
        onUpdate(assets.filter(a => !selectedAssetIds.has(a.id)));
        setSelectedAssetIds(new Set());
        showToast('Bulk deletion complete', 'success');
     }
  };

  const handleBulkStatusChange = (newStatus: Status) => {
     if(selectedAssetIds.size === 0) return;
     onUpdate(assets.map(a => selectedAssetIds.has(a.id) ? { ...a, status: newStatus } : a));
     setSelectedAssetIds(new Set());
     showToast(`Updated status to ${newStatus}`, 'success');
  };

  const handleExport = () => {
    try {
      const headers = ['Name', 'Vendor', 'Type', 'Amount', 'Currency', 'Billing Cycle', 'Status', 'Renewal Date', 'Department'];
      const rows = filteredAssets.map(a => [
        `"${a.name}"`,
        `"${a.vendor}"`,
        a.type,
        a.amount,
        a.currency,
        a.billingCycle,
        a.status,
        a.nextRenewal || 'Perpetual',
        a.department
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SubGuard_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Registry exported successfully', 'success');
    } catch (e) {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleQuickRenew = (assetId: string) => {
     const asset = assets.find(a => a.id === assetId);
     if (!asset || !asset.nextRenewal) return;

     const currentdate = new Date(asset.nextRenewal);
     const newDate = new Date(currentdate);
     
     if (asset.billingCycle === PeriodType.MONTHLY_FIX) newDate.setMonth(newDate.getMonth() + 1);
     else if (asset.billingCycle === PeriodType.YEARLY) newDate.setFullYear(newDate.getFullYear() + 1);
     else if (asset.billingCycle === PeriodType.QUARTERLY) newDate.setMonth(newDate.getMonth() + 3);
     else return;

     const updated = assets.map(a => a.id === assetId ? { ...a, nextRenewal: newDate.toISOString().split('T')[0] } : a);
     onUpdate(updated);
     
     const log: AuditLog = {
        id: Math.random().toString(36),
        action: 'Quick Renewal',
        actor: user.businessName,
        target: asset.name,
        timestamp: new Date().toISOString(),
        details: `Renewed until ${newDate.toISOString().split('T')[0]}`
     };
     onLogUpdate([log, ...logs]);
     showToast(`Renewed ${asset.name} successfully`, 'success');
  };

  const handleFormSubmit = (data: Asset) => {
    if (editingAsset) {
      onUpdate(assets.map(a => a.id === editingAsset.id ? data : a));
      showToast('Asset updated successfully', 'success');
    } else {
      onUpdate([...assets, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
      showToast('New asset registered', 'success');
    }
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleVendorSave = () => {
    if (!editingVendor) return;
    const exists = vendorProfiles.some(v => v.name === editingVendor.name);
    if (exists) {
        setVendorProfiles(prev => prev.map(v => v.name === editingVendor.name ? editingVendor : v));
    } else {
        setVendorProfiles(prev => [...prev, editingVendor]);
    }
    setIsVendorModalOpen(false);
    setEditingVendor(null);
    showToast('Vendor profile updated', 'success');
  };

  const handleEditProfileClick = () => {
    setTempUser(user);
    setIsEditProfileOpen(true);
    setIsProfileOpen(false);
  };

  const handleSaveProfile = () => {
    onUserUpdate(tempUser);
    setIsEditProfileOpen(false);
    showToast('Profile updated', 'success');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(config.currency === 'IDR' ? 'id-ID' : 'en-US', { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(config.currency === 'USD' ? val / 15500 : val);
  };

  // Role Management Helpers
  const togglePermission = (roleId: string, permId: string) => {
     if (!editingRole) return;
     const hasPerm = editingRole.permissions.includes(permId);
     const newPerms = hasPerm 
        ? editingRole.permissions.filter(p => p !== permId)
        : [...editingRole.permissions, permId];
     
     const updatedRole = { ...editingRole, permissions: newPerms };
     setEditingRole(updatedRole);
  };

  const saveRole = () => {
     if(!editingRole) return;
     setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
     showToast("Role configuration saved", 'success');
  };

  // Add User/Role Handlers
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      showToast("Please fill in Name and Email", 'error');
      return;
    }
    const member: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name || '',
      email: newMember.email || '',
      roleId: newMember.roleId || 'viewer',
      department: newMember.department || DEPARTMENTS[0],
      status: 'Active',
      lastActive: new Date().toISOString()
    };
    setTeamMembers([...teamMembers, member]);
    setIsUserModalOpen(false);
    setNewMember({ name: '', email: '', roleId: 'viewer', department: DEPARTMENTS[0], status: 'Active' });
    showToast(`Invited ${member.name} to the team`, 'success');
  };

  const handleAddRole = () => {
    if (!newRoleData.name) {
      showToast("Role Name is required", 'error');
      return;
    }
    const newId = newRoleData.name.toLowerCase().replace(/\s+/g, '_');
    const role: Role = {
      id: newId,
      name: newRoleData.name || '',
      description: newRoleData.description || '',
      permissions: []
    };
    setRoles([...roles, role]);
    setIsRoleModalOpen(false);
    setNewRoleData({ name: '', description: '', permissions: [] });
    // Automatically select for editing
    setEditingRole(role);
    showToast(`Role ${role.name} created`, 'success');
  };

  // Delete User Logic
  const handleDeleteMember = (id: string) => {
    if(confirm('Remove this user from the team?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      showToast("User removed", 'info');
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${config.softMode ? 'bg-[#F9FAFB]' : 'bg-slate-100'}`}>
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto min-w-[300px] p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' :
            toast.type === 'error' ? 'bg-white border-rose-100 text-rose-700' :
            'bg-white border-slate-100 text-slate-700'
          }`}>
             <div className={`p-1.5 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-100' :
                toast.type === 'error' ? 'bg-rose-100' : 'bg-slate-100'
             }`}>
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Bell className="w-4 h-4" />}
             </div>
             <p className="text-xs font-black uppercase tracking-wide">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Command Palette Modal */}
      {isCmdOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCmdOpen(false)}></div>
           <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-100">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                 <Search className="w-5 h-5 text-slate-400" />
                 <input 
                    ref={cmdInputRef}
                    type="text" 
                    placeholder="Type a command or search..."
                    value={cmdQuery}
                    onChange={(e) => { setCmdQuery(e.target.value); setCmdIndex(0); }}
                    className="flex-1 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                 />
                 <span className="text-[10px] font-black text-slate-300 bg-slate-50 border border-slate-200 px-2 py-1 rounded">ESC</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                 {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd, idx) => (
                       <button 
                          key={cmd.id}
                          onClick={() => { cmd.action(); setIsCmdOpen(false); }}
                          onMouseEnter={() => setCmdIndex(idx)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${idx === cmdIndex ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                       >
                          <div className="flex items-center gap-3">
                             {cmd.icon}
                             <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-wide">{cmd.label}</p>
                             </div>
                          </div>
                          {cmd.group && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cmd.group}</span>}
                       </button>
                    ))
                 ) : (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">No commands found.</div>
                 )}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-between px-4">
                 <span className="text-[10px] font-bold text-slate-400">ProTip: Use arrows to navigate</span>
                 <div className="flex gap-2">
                    <Command className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-300">Cmd+K</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-20 lg:w-64 border-r border-slate-100 flex flex-col p-6 z-20 relative transition-all duration-300 
         ${config.sidebarTransparent ? 'bg-transparent' : (config.softMode ? 'bg-white' : 'bg-white/80 backdrop-blur-md')}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer" onClick={() => setActiveView('overview')}>
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 shadow-sm group-hover:rotate-12 group-hover:scale-110">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="hidden lg:block font-black text-2xl tracking-tighter text-slate-950 group-hover:text-indigo-600 transition-colors">subguard</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarLink icon={<Home className="w-5 h-5" />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
          <SidebarLink icon={<Database className="w-5 h-5" />} label="Registry (All)" active={activeView === 'registry'} onClick={() => setActiveView('registry')} />
          <SidebarLink icon={<Server className="w-5 h-5" />} label="Licenses & SaaS" active={activeView === 'licenses'} onClick={() => setActiveView('licenses')} />
          <SidebarLink icon={<Building className="w-5 h-5" />} label="Vendor Hub" active={activeView === 'vendors'} onClick={() => setActiveView('vendors')} />
          <SidebarLink icon={<CalendarDays className="w-5 h-5" />} label="Fiscal Calendar" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
          <SidebarLink icon={<Monitor className="w-5 h-5" />} label="Hardware" active={activeView === 'hardware'} onClick={() => setActiveView('hardware')} />
          <div className="pt-4 mt-4 border-t border-slate-50">
             <div className="px-4 pb-2 text-[9px] font-black text-slate-300 uppercase tracking-widest hidden lg:block">Enterprise</div>
             <SidebarLink icon={<FileCheck className="w-5 h-5" />} label="Requests" active={activeView === 'requests'} onClick={() => setActiveView('requests')} badge={requests.filter(r => r.status === 'Pending').length} />
             <SidebarLink icon={<ShieldCheck className="w-5 h-5" />} label="Audit & Compliance" active={activeView === 'compliance'} onClick={() => setActiveView('compliance')} />
             <SidebarLink icon={<Siren className="w-5 h-5" />} label="Risk & Obligations" active={activeView === 'risk'} onClick={() => setActiveView('risk')} badge={stats.highRiskCount} />
             <SidebarLink icon={<Cloud className="w-5 h-5" />} label="Cloud FinOps" active={activeView === 'finops'} onClick={() => setActiveView('finops')} />
          </div>
          <div className="pt-4 mt-4 border-t border-slate-50">
            <SidebarLink icon={<Users className="w-5 h-5" />} label="Team & Access" active={activeView === 'users'} onClick={() => setActiveView('users')} />
            <SidebarLink icon={<Settings className="w-5 h-5" />} label="Admin Center" active={activeView === 'admin'} onClick={() => setActiveView('admin')} />
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <button 
            onClick={onSignOut}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400 font-black text-[11px] uppercase tracking-widest group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block">Secure Exit</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-1">
            <h2 key={activeView} className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none animate-in fade-in slide-in-from-left-2 duration-300">
              {activeView === 'registry' ? 'Master Asset Registry' : activeView === 'risk' ? 'Risk & Obligations' : activeView === 'licenses' ? 'License Management' : activeView === 'finops' ? 'Cloud Cost Optimization' : activeView === 'calendar' ? 'Fiscal Timeline' : activeView === 'admin' ? 'System Settings' : activeView === 'users' ? 'User Management' : activeView === 'vendors' ? 'Vendor Intelligence' : activeView}
            </h2>
            <p className="text-slate-400 font-bold text-[13px] uppercase tracking-widest">
              Protocol v2.5 • <span className="text-indigo-600">{filteredAssets.length}</span> Assets Tracked
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Currency Switcher */}
             <div className="hidden md:flex bg-slate-900 text-white rounded-xl p-1 shadow-md">
                <button 
                   onClick={() => setConfig({...config, currency: 'IDR'})}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${config.currency === 'IDR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                   IDR
                </button>
                <button 
                   onClick={() => setConfig({...config, currency: 'USD'})}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${config.currency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                   USD
                </button>
             </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" placeholder="Search assets..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-100 w-48 lg:w-64 shadow-sm transition-all"
              />
            </div>

            <button 
               onClick={() => setIsCmdOpen(true)}
               className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
               title="Command Palette (Cmd+K)"
            >
               <Command className="w-4 h-4" />
               <span className="text-[10px] font-black">Cmd+K</span>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm hover:border-slate-300 transition-all hover:shadow-md active:scale-95"
              >
                <Bell className="w-5 h-5 text-slate-400" />
                {alerts.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white animate-pulse">
                     {alerts.length}
                   </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Upcoming Renewals (30d)</p>
                      <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black">{alerts.length}</span>
                   </div>
                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {alerts.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">No upcoming renewals.</p>
                      ) : (
                        alerts.map(a => (
                          <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-rose-200 transition-colors group">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-black text-slate-900 truncate max-w-[140px]">{a.name}</span>
                              <span className="text-[9px] font-bold text-slate-500">{new Date(a.nextRenewal!).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] text-slate-500 font-medium">{a.vendor}</span>
                              <span className="text-[10px] font-black text-rose-600">{formatCurrency(a.amount)}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-200 hidden group-hover:flex justify-end">
                               <button onClick={() => handleQuickRenew(a.id)} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                  <RefreshCw className="w-3 h-3" /> Quick Renew
                               </button>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-1.5 pr-4 shadow-sm hover:border-slate-300 transition-all hover:shadow-md active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                  {user.businessName.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100">
                        {user.businessName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 leading-tight truncate">{user.businessName}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <MenuButton icon={<UserIcon />} label="Edit Profile" onClick={handleEditProfileClick} />
                    <MenuButton icon={<CreditCard />} label="Billing & Plan" onClick={() => {}} badge="Pro" />
                    <MenuButton icon={<Settings />} label="Preferences" onClick={() => { setActiveView('admin'); setIsProfileOpen(false); }} />
                    <MenuButton icon={<HelpCircle />} label="Help Center" onClick={() => {}} />
                  </div>

                  <div className="pt-2 border-t border-slate-50">
                    <button onClick={onSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 transition-all text-xs font-black uppercase tracking-widest group">
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
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
              <StatCard title="Total Asset Value" value={formatCurrency(stats.totalValue)} icon={<Database />} color="text-indigo-600" />
              <StatCard title="Monthly Burn Rate" value={formatCurrency(stats.monthlyBurn)} icon={<TrendingUp />} color="text-fuchsia-600" />
              <StatCard title="Renewal Risk (30d)" value={stats.upcomingRenewals.toString()} icon={<AlertCircle />} color="text-rose-600" />
              <StatCard title="High Risk Assets" value={stats.highRiskCount.toString()} icon={<Siren />} color="text-amber-600" />
            </div>

            {/* Financial Forecast Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 uppercase tracking-tight">
                       <AreaChartIcon className="w-5 h-5 text-emerald-500" />
                       12-Month Cash Flow Forecast
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">Projected Spend</span>
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
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} tickFormatter={(value) => `${value / 1000}k`} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px rgba(0,0,0,0.02)', padding: '12px' }}
                              formatter={(value: number) => formatCurrency(value)}
                           />
                           <Area type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all overflow-hidden relative flex flex-col md:flex-row gap-8 hover:shadow-lg hover:border-indigo-100 duration-500">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 uppercase tracking-tight">
                      <PieChart className="w-5 h-5 text-indigo-500" />
                      Cost by Department
                    </h3>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentSpend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px rgba(0,0,0,0.02)', padding: '12px' }}
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
                
                <div className="w-full md:w-1/3 border-l border-slate-100 pl-8 hidden md:block">
                    <h3 className="font-black text-slate-900 text-sm mb-6 uppercase tracking-tight">Top Vendors</h3>
                    <div className="space-y-4">
                       {vendorSpend.map((v, i) => (
                          <div key={i} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-xl transition-colors -mx-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-500">#{i+1}</span>
                                <span className="text-xs font-bold text-slate-700">{v.name}</span>
                             </div>
                             <span className="text-xs font-black text-slate-900">{formatCurrency(v.value)}</span>
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
                    
                    {/* Chat Window */}
                    <div className="flex-1 mb-4 relative z-10 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center h-full opacity-40">
                          <MessageSquare className="w-8 h-8 text-slate-500 mb-3" />
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ask me about renewals, spend, or risk.</p>
                        </div>
                      )}
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

                    {/* Input Area */}
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

        {/* --- VENDORS VIEW --- */}
        {activeView === 'vendors' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {uniqueVendors.map((vendor, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-black group-hover:bg-indigo-600 transition-colors">
                                {vendor.name.charAt(0)}
                             </div>
                             <div>
                                <h3 className="font-black text-sm text-slate-900 truncate max-w-[120px]">{vendor.name}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{vendor.count} Assets</p>
                             </div>
                          </div>
                          {vendor.profile?.tier ? (
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                                vendor.profile.tier === 'Strategic' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                vendor.profile.tier === 'Preferred' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                             }`}>
                                {vendor.profile.tier}
                             </span>
                          ) : (
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Unclassified</span>
                          )}
                       </div>
                       
                       <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-bold text-slate-500">Total Spend</span>
                             <span className="font-black text-slate-900">{formatCurrency(vendor.spend)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (vendor.spend / (stats.totalValue || 1)) * 100)}%` }}></div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                          <button 
                             onClick={() => {
                                setEditingVendor(vendor.profile || { id: Math.random().toString(36), name: vendor.name, tier: 'Transactional' });
                                setIsVendorModalOpen(true);
                             }}
                             className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                          >
                             Manage Profile
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 {/* Empty State / Add New Placeholder if needed, but vendors are derived from assets usually */}
              </div>
           </div>
        )}

        {/* --- USERS & ROLES VIEW --- */}
        {activeView === 'users' && (
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
               <div className="flex gap-4">
                  <button onClick={() => setActiveUserTab('members')} className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${activeUserTab === 'members' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}>Team Members</button>
                  <button onClick={() => setActiveUserTab('roles')} className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${activeUserTab === 'roles' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}>Access Roles</button>
               </div>
               <button 
                  onClick={() => activeUserTab === 'members' ? setIsUserModalOpen(true) : setIsRoleModalOpen(true)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors"
               >
                  <Plus className="w-4 h-4" /> Add {activeUserTab === 'members' ? 'User' : 'Role'}
               </button>
             </div>

             <div className="p-0">
                {activeUserTab === 'members' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teamMembers.map(m => (
                          <tr key={m.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{m.name.charAt(0)}</div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 tracking-tight">{m.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{m.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <Shield className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs font-bold text-slate-700 capitalize">
                                     {roles.find(r => r.id === m.roleId)?.name || m.roleId}
                                  </span>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <Briefcase className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs font-bold text-slate-600">{m.department}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                                  m.status === 'Active' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                  {m.status}
                               </span>
                            </td>
                            <td className="px-6 py-6 text-right">
                               <button onClick={() => handleDeleteMember(m.id)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeUserTab === 'roles' && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="col-span-1 space-y-4">
                        {roles.map(role => (
                           <div 
                              key={role.id} 
                              onClick={() => setEditingRole(role)}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all ${editingRole?.id === role.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}
                           >
                              <div className="flex justify-between items-start mb-3">
                                 <h4 className="font-black text-sm text-slate-900">{role.name}</h4>
                                 {role.id === 'admin' ? <Lock className="w-3 h-3 text-slate-300" /> : <Unlock className="w-3 h-3 text-slate-300" />}
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-4">{role.description}</p>
                              <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50">
                                 <Users className="w-3 h-3 text-slate-300" />
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{teamMembers.filter(m => m.roleId === role.id).length} Users Assigned</span>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Role Editor / Permission Matrix */}
                     <div className="col-span-2 bg-slate-50/50 rounded-3xl border border-slate-100 p-8 relative overflow-hidden">
                        {editingRole ? (
                           <div className="animate-in fade-in slide-in-from-right-2 duration-300 relative z-10">
                              <div className="flex justify-between items-center mb-8">
                                 <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                       <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                       {editingRole.name} Permissions
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Configure functional access levels for this role.</p>
                                 </div>
                                 {editingRole.id !== 'admin' && (
                                     <button onClick={saveRole} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all">
                                        <Save className="w-3 h-3" /> Save Changes
                                     </button>
                                 )}
                              </div>

                              <div className="space-y-8">
                                 {['Assets', 'Finance', 'Team', 'Settings'].map(category => (
                                    <div key={category}>
                                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">{category} Management</h4>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {PERMISSIONS.filter(p => p.category === category).map(perm => (
                                             <div key={perm.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                <span className="text-xs font-bold text-slate-700">{perm.label}</span>
                                                <button 
                                                   disabled={editingRole.id === 'admin'}
                                                   onClick={() => togglePermission(editingRole.id, perm.id)}
                                                   className={`w-12 h-7 rounded-full p-1 transition-all ${editingRole.permissions.includes(perm.id) ? 'bg-indigo-600' : 'bg-slate-200'} ${editingRole.id === 'admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                   <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${editingRole.permissions.includes(perm.id) ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                </button>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                              <ShieldCheck className="w-16 h-16 text-slate-400 mb-6" />
                              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Select a Role</p>
                              <p className="text-xs text-slate-500 font-medium max-w-xs mt-2">Click a role card on the left to configure granular permissions.</p>
                           </div>
                        )}
                     </div>
                  </div>
                )}
             </div>
           </div>
        )}

        {/* --- CALENDAR VIEW --- */}
        {activeView === 'calendar' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-950 uppercase flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-600" /> Fiscal Timeline</h3>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    Next 12 Months
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {MONTHS.map((month, index) => {
                      const currentMonth = new Date().getMonth();
                      const year = index < currentMonth ? new Date().getFullYear() + 1 : new Date().getFullYear();
                      
                      // Filter assets renewing in this month
                      const monthlyRenewals = assets.filter(a => {
                        if (!a.nextRenewal) return false;
                        const d = new Date(a.nextRenewal);
                        return d.getMonth() === index; // Simplified logic for demo
                      });
                      
                      return (
                        <div key={month} className={`rounded-2xl border p-5 flex flex-col h-64 transition-all ${
                          monthlyRenewals.length > 0 ? 'bg-white border-slate-200 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200' : 'bg-slate-50/50 border-slate-100 opacity-60'
                        }`}>
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{month}</span>
                              <span className="text-[9px] font-bold text-slate-400">{year}</span>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                              {monthlyRenewals.map(a => (
                                <div key={a.id} className="flex items-center justify-between text-[10px] p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                                   <div className="flex items-center gap-2 truncate">
                                      <div className={`w-1.5 h-1.5 rounded-full ${a.status === Status.ACTIVE ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                      <span className="font-bold text-slate-700 truncate max-w-[80px] group-hover:text-indigo-600 transition-colors">{a.name}</span>
                                   </div>
                                   <span className="font-black text-slate-900">{formatCurrency(a.amount)}</span>
                                </div>
                              ))}
                              {monthlyRenewals.length === 0 && (
                                <div className="h-full flex items-center justify-center text-[9px] text-slate-300 italic">No renewals</div>
                              )}
                           </div>
                        </div>
                      );
                   })}
                </div>
              </div>
           </div>
        )}

        {/* --- LIST VIEWS --- */}
        {(activeView === 'registry' || activeView === 'licenses' || activeView === 'hardware' || activeView === 'finops' || activeView === 'risk' || activeView === 'compliance') && (
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-slate-400" />
                     <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                        <option value="All">All Status</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-2">
                     <SortAsc className="w-4 h-4 text-slate-400" />
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortType)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                        <option value="name">Name</option>
                        <option value="amount">Amount</option>
                        <option value="date">Date</option>
                     </select>
                  </div>
                </div>

                {/* Bulk Action Toolbar */}
                {selectedAssetIds.size > 0 ? (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedAssetIds.size} Selected</span>
                        <button onClick={handleBulkDelete} className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                           <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <button onClick={() => handleBulkStatusChange(Status.ARCHIVED)} className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                           <Box className="w-4 h-4" /> Archive
                        </button>
                    </div>
                ) : (
                    <button onClick={() => { setEditingAsset(null); setIsFormOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                       <Plus className="w-4 h-4" /> Add Asset
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
                 />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                 <button onClick={handleExport} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Export CSV</button>
                 <span className="text-[10px] font-bold text-slate-400">Showing {filteredAssets.length} of {assets.length} records</span>
              </div>
           </div>
        )}

        {/* --- REQUESTS VIEW --- */}
        {activeView === 'requests' && (
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase mb-6 flex items-center gap-2"><FileCheck className="w-5 h-5 text-indigo-600" /> Procurement Requests</h3>
                 <table className="w-full">
                    <thead>
                       <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Request</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cost</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {requests.map(req => (
                          <tr key={req.id} className="group hover:bg-slate-50">
                             <td className="px-6 py-4">
                                <p className="text-sm font-black text-slate-900">{req.item}</p>
                                <p className="text-[9px] font-bold text-slate-400">{req.type} • {req.date}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-700">{req.requester}</p>
                                <p className="text-[9px] font-bold text-slate-400">{req.department}</p>
                             </td>
                             <td className="px-6 py-4 text-xs font-black text-slate-900">{formatCurrency(req.cost)}</td>
                             <td className="px-6 py-4">
                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                                   req.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                   req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                   'bg-rose-50 text-rose-600'
                                }`}>{req.status}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                {req.status === 'Pending' && (
                                   <div className="flex justify-end gap-2">
                                      <button onClick={() => handleRequestAction(req.id, 'Approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                                      <button onClick={() => handleRequestAction(req.id, 'Rejected')} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"><XCircle className="w-4 h-4" /></button>
                                   </div>
                                )}
                             </td>
                          </tr>
                       ))}
                       {requests.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-8 text-xs font-bold text-slate-400">No requests found.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* --- ADMIN VIEW --- */}
        {activeView === 'admin' && (
           <SettingsView config={config} onConfigChange={setConfig} />
        )}

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

      {/* Vendor Edit Modal */}
      {isVendorModalOpen && editingVendor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsVendorModalOpen(false)}></div>
            <div className="w-full max-w-md h-full bg-white relative z-10 shadow-2xl p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-xl font-black text-slate-900">Vendor Profile</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingVendor.name}</p>
                  </div>
                  <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship Tier</label>
                     <div className="grid grid-cols-2 gap-2 mt-2">
                        {['Strategic', 'Preferred', 'Transactional', 'Restricted'].map(tier => (
                           <button 
                              key={tier}
                              onClick={() => setEditingVendor({...editingVendor, tier: tier as any})}
                              className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${editingVendor.tier === tier ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                           >
                              {tier}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Contacts</label>
                     <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                           <Mail className="w-4 h-4 text-slate-300" />
                           <input 
                              placeholder="support@vendor.com" 
                              value={editingVendor.supportEmail || ''}
                              onChange={(e) => setEditingVendor({...editingVendor, supportEmail: e.target.value})}
                              className="bg-transparent w-full text-xs font-bold focus:outline-none"
                           />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                           <Globe className="w-4 h-4 text-slate-300" />
                           <input 
                              placeholder="vendor.com/help" 
                              value={editingVendor.website || ''}
                              onChange={(e) => setEditingVendor({...editingVendor, website: e.target.value})}
                              className="bg-transparent w-full text-xs font-bold focus:outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Manager</label>
                     <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                           <UserIcon className="w-4 h-4 text-slate-300" />
                           <input 
                              placeholder="Manager Name" 
                              value={editingVendor.contactName || ''}
                              onChange={(e) => setEditingVendor({...editingVendor, contactName: e.target.value})}
                              className="bg-transparent w-full text-xs font-bold focus:outline-none"
                           />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                           <Mail className="w-4 h-4 text-slate-300" />
                           <input 
                              placeholder="manager@vendor.com" 
                              value={editingVendor.contactEmail || ''}
                              onChange={(e) => setEditingVendor({...editingVendor, contactEmail: e.target.value})}
                              className="bg-transparent w-full text-xs font-bold focus:outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Notes</label>
                     <textarea 
                        value={editingVendor.notes || ''}
                        onChange={(e) => setEditingVendor({...editingVendor, notes: e.target.value})}
                        className="w-full mt-2 bg-slate-50 border border-slate-100 rounded-xl p-4 h-24 resize-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                        placeholder="MSA details, discount terms..."
                     />
                  </div>
               </div>

               <div className="absolute bottom-0 left-0 w-full p-8 border-t border-slate-100 bg-white">
                  <button onClick={handleVendorSave} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Save Profile</button>
               </div>
            </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Edit Profile</h3>
                    <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-rose-500"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                        <input 
                            type="text" 
                            value={tempUser.businessName} 
                            onChange={(e) => setTempUser({...tempUser, businessName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={tempUser.email} 
                            onChange={(e) => setTempUser({...tempUser, email: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-100 text-xs font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={handleSaveProfile} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 uppercase tracking-widest shadow-lg shadow-indigo-200 transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Add Team Member</h3>
                    <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={newMember.name || ''} 
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10"
                            placeholder="e.g. Jane Smith"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={newMember.email || ''} 
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10"
                            placeholder="jane@company.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                          <select 
                             value={newMember.roleId || 'viewer'} 
                             onChange={(e) => setNewMember({...newMember, roleId: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                          >
                             {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                          <select 
                             value={newMember.department || DEPARTMENTS[0]} 
                             onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                          >
                             {config.departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-100 text-xs font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={handleAddMember} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 uppercase tracking-widest shadow-lg shadow-indigo-200 transition-colors">Invite User</button>
                </div>
            </div>
        </div>
      )}

      {/* Add Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Create New Role</h3>
                    <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                        <input 
                            type="text" 
                            value={newRoleData.name || ''} 
                            onChange={(e) => setNewRoleData({...newRoleData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10"
                            placeholder="e.g. Audit Viewer"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea 
                            value={newRoleData.description || ''} 
                            onChange={(e) => setNewRoleData({...newRoleData, description: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 h-24 resize-none"
                            placeholder="Describe what this role allows..."
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-100 text-xs font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={handleAddRole} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 uppercase tracking-widest shadow-lg shadow-indigo-200 transition-colors">Create & Configure</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl transition-all group relative ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
       {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
    <span className={`hidden lg:block text-[11px] font-black uppercase tracking-widest ${active ? 'text-white' : ''}`}>
      {label}
    </span>
    {badge ? (
       <span className="hidden lg:flex absolute right-4 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full items-center justify-center border-2 border-white animate-pulse">
          {badge}
       </span>
    ) : null}
  </button>
);

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        {React.cloneElement(icon as React.ReactElement, { className: "w-24 h-24 text-slate-900" })}
     </div>
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
     </div>
     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
     <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const MenuButton = ({ icon, label, onClick, badge }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all group">
     <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
        <span className="text-xs font-bold">{label}</span>
     </div>
     {badge && <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded-md">{badge}</span>}
     <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
  </button>
);
