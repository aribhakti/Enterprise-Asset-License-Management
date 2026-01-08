
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
}

export const SubscriptionTable: React.FC<Props> = ({ assets, onEdit, onDelete, currency, selectedIds, onToggleSelect, onSelectAll }) => {
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
        <tr className="text-left bg-slate-50/50">
          <th className="pl-6 py-5 w-10 border-b border-slate-100">
             <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          </th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Asset</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Owner</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Value</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Renewal</th>
          <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
          <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {assets.map((asset) => (
          <tr key={asset.id} className={`group transition-all cursor-default ${selectedIds?.has(asset.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
            <td className="pl-6 py-6">
                <input 
                    type="checkbox" 
                    checked={selectedIds?.has(asset.id)} 
                    onChange={() => onToggleSelect && onToggleSelect(asset.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
            </td>
            <td className="px-4 py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                  {getIcon(asset.type)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{asset.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{asset.category}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-6">
              <div className="flex flex-col">
                 <span className="text-xs font-black text-slate-700">{asset.owner}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{asset.department}</span>
              </div>
            </td>
            <td className="px-4 py-6 font-black text-slate-900 text-sm tracking-tight">
              {formatCurrency(asset.amount)}
            </td>
            <td className="px-4 py-6">
               {asset.nextRenewal ? (
                 <span className="text-[11px] font-black text-indigo-600 tracking-tight">{new Date(asset.nextRenewal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
               ) : (
                 <span className="text-[9px] font-black text-slate-300 uppercase">Perpetual</span>
               )}
            </td>
            <td className="px-4 py-6">
              <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                asset.status === Status.ACTIVE 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {asset.status}
              </span>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => onEdit(asset)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDelete(asset.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
