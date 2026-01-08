
import React, { useState } from 'react';
import { Asset, Status, AssetType, PeriodType, Assignment } from '../types';
import { MONTHS } from '../constants';
import { X, Save, Zap, History, Layout, ChevronRight, Bell, BellOff, Upload, FileText, Monitor, CreditCard, Users, ShieldCheck, Download, Plus, Trash2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Asset;
  categories: string[];
  departments: string[];
  currency: string;
}

type TabType = 'general' | 'financial' | 'operational' | 'compliance';

export const SubscriptionForm: React.FC<Props> = ({ onClose, onSubmit, initialData, categories, departments, currency }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>(initialData || {
    name: '',
    type: AssetType.SAAS,
    category: categories[0],
    vendor: '',
    owner: '',
    department: departments[0],
    legalEntity: '',
    amount: 0,
    status: Status.ACTIVE,
    billingCycle: PeriodType.MONTHLY_FIX,
    nextRenewal: '',
    autoRenew: true,
    capex: false,
    depreciationMethod: 'None',
    seats: 1,
    assignments: [],
    notes: '',
    remindersEnabled: true,
    reminderDaysBefore: 30,
    utilization: 100,
    riskScore: 0,
    riskFactors: [],
    documents: [],
    serialNumber: '',
    location: '',
    warrantyExpiry: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: Math.random().toString(36),
      assignee: 'New User',
      role: 'User',
      assignedDate: new Date().toISOString().split('T')[0]
    };
    setFormData(prev => ({
      ...prev,
      assignments: [...(prev.assignments || []), newAssignment]
    }));
  };

  const removeAssignment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignments: (prev.assignments || []).filter(a => a.id !== id)
    }));
  };

  // NEW: AI Auto-Generation Logic
  const handleAiGenerate = async () => {
    if(!formData.name) return alert("Please enter an Asset Name first.");
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a professional business description (max 2 sentences) and 3 potential risk factors (comma separated) for a software/asset named "${formData.name}" from vendor "${formData.vendor || 'Unknown'}". 
        Format: Description|Risk1, Risk2, Risk3`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        
        const text = response.text || "";
        const [desc, risks] = text.split('|');
        
        setFormData(prev => ({
            ...prev,
            notes: desc ? desc.trim() : prev.notes,
            riskFactors: risks ? risks.split(',').map(r => r.trim()) : prev.riskFactors,
            riskScore: 50 // Default medium risk for AI analyzed items
        }));

    } catch (e) {
        console.error(e);
        alert("AI Generation failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="w-full max-w-4xl relative bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/50 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 bg-gradient-primary flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
              {initialData?.type === AssetType.HARDWARE ? <Monitor className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">
                {initialData ? initialData.name : 'New Asset Registration'}
              </h3>
              <p className="text-[9px] text-white/70 font-black uppercase tracking-widest">EALM Protocol • {formData.id || 'Draft'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
             <button type="submit" onClick={handleSubmit} className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Record
             </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-slate-100 flex items-center gap-8 shrink-0 bg-white">
           <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label="General Info" icon={<Layout className="w-4 h-4" />} />
           <TabButton active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} label="Financials" icon={<CreditCard className="w-4 h-4" />} />
           <TabButton active={activeTab === 'operational'} onClick={() => setActiveTab('operational')} label="Operational" icon={<Users className="w-4 h-4" />} />
           <TabButton active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} label="Risk & Compliance" icon={<ShieldCheck className="w-4 h-4" />} />
        </div>

        <div className="p-10 overflow-y-auto">
           {activeTab === 'general' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                <InputGroup label="Asset Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Salesforce CRM" required />
                <SelectGroup label="Asset Type" name="type" value={formData.type} onChange={handleChange} options={Object.values(AssetType)} />
                
                <InputGroup label="Vendor" name="vendor" value={formData.vendor} onChange={handleChange} placeholder="e.g. Salesforce Inc." />
                <SelectGroup label="Category" name="category" value={formData.category} onChange={handleChange} options={categories} />
                
                <InputGroup label="Primary Owner (PIC)" name="owner" value={formData.owner} onChange={handleChange} placeholder="Person accountable" />
                <SelectGroup label="Department / Cost Center" name="department" value={formData.department} onChange={handleChange} options={departments} />
                
                <InputGroup label="Legal Entity (Subsidiary)" name="legalEntity" value={formData.legalEntity} onChange={handleChange} placeholder="e.g. Holding Corp Ltd." />
                <SelectGroup label="Lifecycle Stage" name="status" value={formData.status} onChange={handleChange} options={Object.values(Status)} />
                
                <div className="md:col-span-2">
                   <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes & Description</label>
                      <button 
                        type="button" 
                        onClick={handleAiGenerate}
                        disabled={isGenerating}
                        className="text-[9px] font-black text-fuchsia-600 uppercase tracking-widest flex items-center gap-1 hover:bg-fuchsia-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                         <Sparkles className="w-3 h-3" /> {isGenerating ? 'Analyzing...' : 'AI Auto-Fill'}
                      </button>
                   </div>
                   <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-bold text-slate-700 resize-none" placeholder="Enter additional context, contract numbers, or specific configuration details..."></textarea>
                </div>
             </div>
           )}

           {activeTab === 'financial' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                <InputGroup label={`Contract Value (${currency})`} name="amount" type="number" value={formData.amount} onChange={handleChange} required />
                <SelectGroup label="Billing Cycle" name="billingCycle" value={formData.billingCycle} onChange={handleChange} options={Object.values(PeriodType)} />
                
                <InputGroup label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} />
                <InputGroup label="Next Renewal / Expiry" name="nextRenewal" type="date" value={formData.nextRenewal} onChange={handleChange} />
                
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">CapEx Asset</p>
                        <p className="text-[9px] font-bold text-slate-400">Capital Expenditure (Depreciable)</p>
                    </div>
                    <button type="button" onClick={() => setFormData(p => ({...p, capex: !p.capex}))} className={`w-10 h-6 rounded-full p-1 transition-all ${formData.capex ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.capex ? 'translate-x-4' : ''}`}></div>
                    </button>
                </div>

                {formData.capex && (
                   <SelectGroup label="Depreciation Method" name="depreciationMethod" value={formData.depreciationMethod} onChange={handleChange} options={['Straight Line', 'Double Declining', 'None']} />
                )}

                {formData.type !== AssetType.HARDWARE && (
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Auto-Renewal</p>
                          <p className="text-[9px] font-bold text-slate-400">Automatically renews at term end</p>
                      </div>
                      <button type="button" onClick={() => setFormData(p => ({...p, autoRenew: !p.autoRenew}))} className={`w-10 h-6 rounded-full p-1 transition-all ${formData.autoRenew ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.autoRenew ? 'translate-x-4' : ''}`}></div>
                      </button>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'operational' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {formData.type === AssetType.HARDWARE && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
                     <div className="md:col-span-2"><h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Hardware Specifics</h4></div>
                     <InputGroup label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="e.g. S/N 12345678" />
                     <InputGroup label="Physical Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. HQ - Server Room B" />
                     <InputGroup label="Warranty Expiry" name="warrantyExpiry" type="date" value={formData.warrantyExpiry} onChange={handleChange} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="md:col-span-2 space-y-3">
                      <div className="flex justify-between">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Utilization / Seat Usage</label>
                         <span className="text-xs font-black text-indigo-600">{formData.utilization}%</span>
                      </div>
                      <input type="range" name="utilization" min="0" max="100" value={formData.utilization} onChange={handleChange} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                   </div>
                   
                   <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">License Assignments</h4>
                         <button onClick={addAssignment} type="button" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Assignee
                         </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                         <table className="w-full">
                            <thead className="bg-slate-100/50">
                               <tr>
                                  <th className="text-left px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                                  <th className="text-left px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                  <th className="text-left px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="w-10"></th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {formData.assignments?.map(assign => (
                                  <tr key={assign.id}>
                                     <td className="px-4 py-2"><input value={assign.assignee} onChange={(e) => {
                                        const newAssigns = formData.assignments?.map(a => a.id === assign.id ? {...a, assignee: e.target.value} : a);
                                        setFormData({...formData, assignments: newAssigns});
                                     }} className="bg-transparent text-xs font-bold text-slate-700 w-full focus:outline-none" /></td>
                                     <td className="px-4 py-2"><input value={assign.role} onChange={(e) => {
                                        const newAssigns = formData.assignments?.map(a => a.id === assign.id ? {...a, role: e.target.value} : a);
                                        setFormData({...formData, assignments: newAssigns});
                                     }} className="bg-transparent text-xs font-bold text-slate-700 w-full focus:outline-none" /></td>
                                     <td className="px-4 py-2 text-[10px] font-bold text-slate-500">{assign.assignedDate}</td>
                                     <td className="px-4 py-2"><button type="button" onClick={() => removeAssignment(assign.id)} className="text-slate-300 hover:text-rose-500"><X className="w-3 h-3" /></button></td>
                                  </tr>
                               ))}
                               {(!formData.assignments || formData.assignments.length === 0) && (
                                  <tr><td colSpan={4} className="px-4 py-6 text-center text-[10px] text-slate-400 italic">No active assignments recorded.</td></tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'compliance' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <div className="flex justify-between">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Score (1-100)</label>
                         <span className={`text-xs font-black ${formData.riskScore > 70 ? 'text-rose-600' : formData.riskScore > 40 ? 'text-amber-500' : 'text-emerald-600'}`}>{formData.riskScore || 0}</span>
                      </div>
                      <input type="range" name="riskScore" min="0" max="100" value={formData.riskScore} onChange={handleChange} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Factors (Comma separated)</label>
                      <input type="text" value={formData.riskFactors?.join(', ')} onChange={(e) => setFormData(p => ({...p, riskFactors: e.target.value.split(',').map(s => s.trim())}))} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900" placeholder="e.g. Single Vendor, No SLA" />
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Attached Documents</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.documents?.map((doc, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                               <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{doc}</span>
                            </div>
                            <button type="button" onClick={() => setFormData(p => ({...p, documents: p.documents?.filter((_, i) => i !== idx)}))} className="text-slate-300 hover:text-rose-500"><X className="w-4 h-4" /></button>
                         </div>
                      ))}
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white transition-colors cursor-pointer group h-[72px]" onClick={() => {
                         const name = prompt("Simulate Upload: Enter file name");
                         if(name) setFormData(p => ({...p, documents: [...(p.documents || []), name]}));
                      }}>
                         <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-500 flex items-center gap-2"><Upload className="w-3 h-3" /> Upload New</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reminder Policy</label>
                      <div className="flex items-center gap-4">
                         <button type="button" onClick={() => setFormData(p => ({...p, remindersEnabled: !p.remindersEnabled}))} className={`flex-1 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${formData.remindersEnabled ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>
                            {formData.remindersEnabled ? 'Alerts On' : 'Alerts Off'}
                         </button>
                         {formData.remindersEnabled && (
                            <div className="flex-1 relative">
                               <input type="number" name="reminderDaysBefore" value={formData.reminderDaysBefore} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:outline-none" />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">Days Before</span>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-6 border-b-2 text-xs font-black uppercase tracking-widest transition-all ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
     {icon} {label}
  </button>
);

const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", required = false }: any) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input name={name} type={type} required={required} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900 placeholder:text-slate-300"
    />
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options }: any) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs font-black text-slate-900 appearance-none cursor-pointer"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
  </div>
);
