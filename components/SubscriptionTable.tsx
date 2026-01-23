
import React from 'react';
import { Asset, Status, AssetType } from '../types';
import { Edit2, Trash2, Bell, BellOff, Server, Monitor, Cloud, Box } from 'lucide-react';

interface Props {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  currency: 'IDR' | 'USD';
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  lang?: 'en' | 'id';
}

const TABLE_TRANSLATIONS = {
  en: {
    asset: 'Asset',
    owner: 'Owner',
    value: 'Value',
    renewal: 'Renewal',
    status: 'Status',
    action: 'Action',
    perpetual: 'Perpetual'
  },
  id: {
    asset: 'Aset',
    owner: 'Pemilik',
    value: 'Nilai',
    renewal: 'Pembaruan',
    status: 'Status',
    action: 'Aksi',
    perpetual: 'Seumur Hidup'
  }
};

export const SubscriptionTable: React.FC<Props> = ({ assets, onEdit, onDelete, currency, selectedIds, onToggleSelect, onSelectAll, lang = 'en' }) => {
  const T = TABLE_TRANSLATIONS[lang];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(currency === 'USD' ? val / 15500 : val);
  };

  const getIcon = (type: AssetType) => {
    switch(type) {
      case AssetType.HARDWARE: return <Monitor className="w-4 h-4" />;
      case AssetType.CLOUD: return <Cloud className="w-4 h-4" />;
      case AssetType.SAAS: return <Box className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSelectAll) {
          if (e.target.checked) {
              onSelectAll(assets.map(a => a.id));
          } else {
              onSelectAll([]);
          }
      }
  };

  const allSelected = assets.length > 0 && selectedIds?.size === assets.length;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-left bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <th className="pl-6 py-5 w-10">
             <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
          </th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.asset}</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.owner}</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.value}</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.renewal}</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.status}</th>
          <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{T.action}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {assets.map((asset) => (
          <tr key={asset.id} className={`group transition-all cursor-default ${selectedIds?.has(asset.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
            <td className="pl-6 py-6">
                <input 
                    type="checkbox" 
                    checked={selectedIds?.has(asset.id)} 
                    onChange={() => onToggleSelect && onToggleSelect(asset.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-transparent" 
                />
            </td>
            <td className="px-4 py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {getIcon(asset.type)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{asset.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{asset.category}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-6">
              <div className="flex flex-col">
                 <span className="text-xs font-black text-slate-700 dark:text-slate-300">{asset.owner}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{asset.department}</span>
              </div>
            </td>
            <td className="px-4 py-6 font-black text-slate-900 dark:text-white text-sm tracking-tight">
              {formatCurrency(asset.amount)}
            </td>
            <td className="px-4 py-6">
               {asset.nextRenewal ? (
                 <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{new Date(asset.nextRenewal).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
               ) : (
                 <span className="text-[9px] font-black text-slate-300 uppercase">{T.perpetual}</span>
               )}
            </td>
            <td className="px-4 py-6">
              <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                asset.status === Status.ACTIVE 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
              }`}>
                {asset.status}
              </span>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => onEdit(asset)} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDelete(asset.id)} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
