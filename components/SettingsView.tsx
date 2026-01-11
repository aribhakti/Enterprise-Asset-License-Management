
import React, { useState } from 'react';
import { 
  Layout, Type, Building, CreditCard, Save, Upload, 
  Check, Globe, Moon, Sun, Monitor, FileText, ToggleLeft, ToggleRight, 
  ChevronRight, Banknote, Mail, Clock, ShieldCheck, UserCheck, Lock
} from 'lucide-react';
import { DashboardConfig } from '../types';

interface SettingsProps {
  config: DashboardConfig;
  onConfigChange: (newConfig: DashboardConfig) => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState('brand');

  const tabs = [
    { id: 'brand', label: 'Brand Settings', icon: <Layout className="w-4 h-4" /> },
    { id: 'system', label: 'System Settings', icon: <Type className="w-4 h-4" /> },
    { id: 'governance', label: 'Governance & Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'company', label: 'Company Settings', icon: <Building className="w-4 h-4" /> },
    { id: 'currency', label: 'Currency Settings', icon: <Banknote className="w-4 h-4" /> },
    { id: 'email', label: 'Email Settings', icon: <Mail className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment Settings', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm space-y-1 sticky top-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {activeTab === 'brand' && <BrandSettings config={config} onChange={onConfigChange} />}
          {activeTab === 'system' && <SystemSettings config={config} onChange={onConfigChange} />}
          {activeTab === 'governance' && <GovernanceSettings config={config} onChange={onConfigChange} />}
          {activeTab === 'company' && <CompanySettings config={config} onChange={onConfigChange} />}
          {activeTab === 'currency' && <CurrencySettings config={config} onChange={onConfigChange} />}
          {activeTab === 'email' && <EmailSettings config={config} onChange={onConfigChange} />}
          {activeTab === 'payment' && <PaymentSettings config={config} onChange={onConfigChange} />}
        </div>
      </div>
    </div>
  );
};

const BrandSettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">Brand Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Customize the look and feel of your dashboard</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Dark</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-32 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-3">
               <span className="text-white font-black italic">LOGO</span>
            </div>
            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-2">
              <Upload className="w-3 h-3" /> Choose file
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Light</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
             <div className="w-32 h-12 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center mb-3">
               <span className="text-slate-900 font-black italic">LOGO</span>
            </div>
            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-2">
              <Upload className="w-3 h-3" /> Choose file
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <SelectGroup 
            label="Default Language" 
            value={config.language} 
            onChange={(val) => onChange({...config, language: val})} 
            options={['English', 'Indonesian', 'Spanish', 'French']} 
         />
         <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Enable RTL</p>
                <p className="text-[9px] font-bold text-slate-400">Right-to-left layout support</p>
            </div>
            <ToggleSwitch isOn={config.enableRtl} onToggle={() => onChange({...config, enableRtl: !config.enableRtl})} />
         </div>
      </div>

      <div className="space-y-4">
         <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Theme Customizer</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Primary Color</label>
               <div className="flex gap-2">
                  {['#4f46e5', '#10b981', '#f43f5e', '#f59e0b'].map(color => (
                     <div 
                        key={color}
                        onClick={() => onChange({...config, primaryColor: color})}
                        className={`w-8 h-8 rounded-lg cursor-pointer transition-transform hover:scale-110 ${config.primaryColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                        style={{ backgroundColor: color }}
                     ></div>
                  ))}
               </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Sidebar</label>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Transparent</span>
                  <ToggleSwitch isOn={config.sidebarTransparent} onToggle={() => onChange({...config, sidebarTransparent: !config.sidebarTransparent})} />
               </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Appearance</label>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{config.darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  <ToggleSwitch isOn={config.darkMode} onToggle={() => onChange({...config, darkMode: !config.darkMode})} />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SystemSettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
   return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">System Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Configure global formats and prefixes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <SelectGroup label="Date Format" value={config.dateFormat} onChange={(v) => onChange({...config, dateFormat: v})} options={['Jan 1, 2025', '01/01/2025', '2025-01-01']} />
         <SelectGroup label="Time Format" value={config.timeFormat} onChange={(v) => onChange({...config, timeFormat: v})} options={['12 Hours (AM/PM)', '24 Hours']} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <InputGroup label="Customer Prefix" value={config.customerPrefix} onChange={(v) => onChange({...config, customerPrefix: v})} />
         <InputGroup label="Vendor Prefix" value={config.vendorPrefix} onChange={(v) => onChange({...config, vendorPrefix: v})} />
         <InputGroup label="Invoice Prefix" value={config.invoicePrefix} onChange={(v) => onChange({...config, invoicePrefix: v})} />
         <InputGroup label="Proposal Prefix" value={config.proposalPrefix} onChange={(v) => onChange({...config, proposalPrefix: v})} />
         <InputGroup label="Bill Prefix" value={config.billPrefix} onChange={(v) => onChange({...config, billPrefix: v})} />
         <InputGroup label="Quotation Prefix" value={config.quotationPrefix} onChange={(v) => onChange({...config, quotationPrefix: v})} />
      </div>
      
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Display Shipping</p>
              <p className="text-[9px] font-bold text-slate-400">In Proposal / Invoice / Bill</p>
          </div>
          <ToggleSwitch isOn={config.displayShipping} onToggle={() => onChange({...config, displayShipping: !config.displayShipping})} />
      </div>

      <div className="space-y-4">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Footer Note</label>
         <textarea 
            value={config.invoiceFooter}
            onChange={(e) => onChange({...config, invoiceFooter: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[120px] text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
         />
      </div>
    </div>
   );
};

const GovernanceSettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
   const toggleAction = (action: string) => {
      const current = config.checkerActions || [];
      const updated = current.includes(action) 
         ? current.filter(a => a !== action)
         : [...current, action];
      onChange({...config, checkerActions: updated});
   };

   return (
      <div className="p-8 space-y-8">
         <div className="border-b border-slate-50 pb-6 mb-6">
            <h3 className="text-xl font-black text-slate-900 uppercase">Governance & Security</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Control approvals, access, and security policies</p>
         </div>

         {/* Checker-Maker Flow Settings */}
         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 transition-all">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                     <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Checker-Maker Protocol</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-sm">Require secondary approval for sensitive actions. Makers initiate, Checkers approve.</p>
                  </div>
               </div>
               <ToggleSwitch isOn={config.enableCheckerMaker} onToggle={() => onChange({...config, enableCheckerMaker: !config.enableCheckerMaker})} />
            </div>
            
            {config.enableCheckerMaker && (
               <div className="pt-6 border-t border-slate-200 animate-in slide-in-from-top-2 duration-300 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <InputGroup 
                        label={`Approval Threshold (${config.currency})`} 
                        type="number"
                        value={config.checkerThreshold.toString()} 
                        onChange={(v) => onChange({...config, checkerThreshold: parseFloat(v) || 0})} 
                     />
                     <SelectGroup 
                        label="Designated Checker Role" 
                        value={config.checkerRole} 
                        onChange={(v) => onChange({...config, checkerRole: v})} 
                        options={['manager', 'admin', 'finance_lead', 'director']} 
                     />
                  </div>
                  
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Trigger Actions</label>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                           { id: 'create', label: 'Asset Creation' },
                           { id: 'update', label: 'Financial Updates' },
                           { id: 'delete', label: 'Asset Deletion' },
                           { id: 'user', label: 'User Role Changes' }
                        ].map(action => (
                           <div key={action.id} onClick={() => toggleAction(action.id)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${config.checkerActions?.includes(action.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${config.checkerActions?.includes(action.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                 {config.checkerActions?.includes(action.id) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{action.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
               <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                     <Lock className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">IP Restriction</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1">Limit access to corporate VPN/Office IPs only.</p>
                  </div>
               </div>
               <div className="flex justify-end">
                  <ToggleSwitch isOn={config.ipRestriction} onToggle={() => onChange({...config, ipRestriction: !config.ipRestriction})} />
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
               <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Audit Logging</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1">Immutable record of all system changes.</p>
                  </div>
               </div>
               <div className="flex justify-end">
                  <ToggleSwitch isOn={config.showEventLog} onToggle={() => onChange({...config, showEventLog: !config.showEventLog})} />
               </div>
            </div>
         </div>
      </div>
   );
};

const CompanySettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
   return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">Company Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manage your legal entity details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <InputGroup label="Company Name" value={config.companyName} onChange={(v) => onChange({...config, companyName: v})} />
         <InputGroup label="Address" value={config.companyAddress} onChange={(v) => onChange({...config, companyAddress: v})} />
         <InputGroup label="City" value={config.companyCity} onChange={(v) => onChange({...config, companyCity: v})} />
         <InputGroup label="State" value={config.companyState} onChange={(v) => onChange({...config, companyState: v})} />
         <InputGroup label="Zip / Postal Code" value={config.companyZip} onChange={(v) => onChange({...config, companyZip: v})} />
         <InputGroup label="Country" value={config.companyCountry} onChange={(v) => onChange({...config, companyCountry: v})} />
         <InputGroup label="Telephone" value={config.companyPhone} onChange={(v) => onChange({...config, companyPhone: v})} />
         <InputGroup label="Company Registration Number" value={config.companyReg} onChange={(v) => onChange({...config, companyReg: v})} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <InputGroup label="Start Time" type="time" value={config.startTime} onChange={(v) => onChange({...config, startTime: v})} />
         <InputGroup label="End Time" type="time" value={config.endTime} onChange={(v) => onChange({...config, endTime: v})} />
         <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 h-full">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tax Number</span>
            <ToggleSwitch isOn={config.taxNumber} onToggle={() => onChange({...config, taxNumber: !config.taxNumber})} />
         </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
         <InputGroup label="Timezone" value={config.timezone} onChange={(v) => onChange({...config, timezone: v})} />
      </div>
    </div>
   );
};

const CurrencySettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
   return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">Currency Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Set your default reporting currency</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Code</label>
            <select 
               value={config.currency} 
               onChange={(e) => onChange({...config, currency: e.target.value as 'IDR' | 'USD'})}
               className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer"
            >
               <option value="IDR">IDR - Indonesian Rupiah</option>
               <option value="USD">USD - United States Dollar</option>
            </select>
         </div>
         <InputGroup label="Currency Symbol" value={config.currency === 'IDR' ? 'Rp' : '$'} readOnly />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <SelectGroup label="Decimal Format" value={config.decimalFormat} onChange={(v) => onChange({...config, decimalFormat: v})} options={['1,234.56', '1.234,56']} />
         <SelectGroup label="Currency Position" value={config.currencyPosition} onChange={(v) => onChange({...config, currencyPosition: v})} options={['Pre (Rp 100)', 'Post (100 Rp)']} />
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
         <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Banknote className="w-6 h-6" />
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preview</p>
            <p className="text-2xl font-black text-slate-900">
               {config.currency === 'IDR' ? 'Rp 150.000.000' : '$ 10,000.00'}
            </p>
         </div>
      </div>
    </div>
   );
};

const EmailSettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">Email Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Configure SMTP for system notifications</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <InputGroup label="Mail Driver" value={config.mailDriver} onChange={(v) => onChange({...config, mailDriver: v})} />
         <InputGroup label="Mail Host" value={config.mailHost} onChange={(v) => onChange({...config, mailHost: v})} />
         <InputGroup label="Mail Port" value={config.mailPort} onChange={(v) => onChange({...config, mailPort: v})} />
         <InputGroup label="Mail Username" value={config.mailUsername} onChange={(v) => onChange({...config, mailUsername: v})} />
         <InputGroup label="Mail Password" type="password" value={config.mailPassword} onChange={(v) => onChange({...config, mailPassword: v})} />
         <InputGroup label="Mail Encryption" value={config.mailEncryption} onChange={(v) => onChange({...config, mailEncryption: v})} />
         <InputGroup label="From Address" value={config.mailFromAddress} onChange={(v) => onChange({...config, mailFromAddress: v})} />
         <InputGroup label="From Name" value={config.mailFromName} onChange={(v) => onChange({...config, mailFromName: v})} />
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
         <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Test Mail</button>
      </div>
    </div>
  );
};

const PaymentSettings = ({ config, onChange }: { config: DashboardConfig, onChange: (c: DashboardConfig) => void }) => {
   const gateways = [
      'Bank Transfer', 'Stripe', 'Paypal', 'Paystack', 
      'Flutterwave', 'Razorpay', 'Paytm', 'Mercado Pago', 
      'Mollie', 'Skrill', 'CoinGate', 'PaymentWall'
   ];

   const toggleGateway = (name: string) => {
      const current = config.paymentGateways || {};
      onChange({
         ...config,
         paymentGateways: {
            ...current,
            [name]: !current[name]
         }
      });
   };

   return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-50 pb-6 mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase">Payment Settings</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enable payment gateways for invoice settlement</p>
      </div>

      <div className="space-y-4">
         {gateways.map((gw) => (
            <div key={gw} className="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all">
               <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{gw}</span>
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enable:</span>
                  <ToggleSwitch 
                     isOn={config.paymentGateways?.[gw] || false} 
                     onToggle={() => toggleGateway(gw)} 
                  />
               </div>
            </div>
         ))}
      </div>
    </div>
   );
};

interface InputProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  type?: string;
}

const InputGroup = ({ label, value, onChange, readOnly, type = "text" }: InputProps) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900 placeholder:text-slate-300"
    />
  </div>
);

interface SelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

const SelectGroup = ({ label, value, onChange, options }: SelectProps) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select 
         value={value} 
         onChange={(e) => onChange(e.target.value)}
         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
    </div>
  </div>
);

const ToggleSwitch = ({ isOn, onToggle }: { isOn: boolean; onToggle?: () => void }) => {
   return (
      <button 
         onClick={onToggle}
         className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${isOn ? 'bg-indigo-600' : 'bg-slate-200'}`}
         type="button"
      >
         <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
   );
};
