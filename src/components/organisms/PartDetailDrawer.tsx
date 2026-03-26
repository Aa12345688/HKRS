import React from 'react';
import { X, History, TrendingDown, TrendingUp, Info, Package, DollarSign, Calendar } from 'lucide-react';
import { PartItem } from '../molecules/PartCard';
import { Transaction } from '../../store/useInventoryStore';
import { Badge } from '../atoms/Badge';

interface PartDetailDrawerProps {
  part: PartItem | null;
  transactions: Transaction[];
  onClose: () => void;
}

export const PartDetailDrawer: React.FC<PartDetailDrawerProps> = ({ part, transactions, onClose }) => {
  if (!part) return null;

  const partTransactions = transactions.filter(t => t.partId === part.id);
  const isLowStock = part.stock <= part.safeStock;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] animate-in fade-in" onClick={onClose}></div>
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0c10] border-l border-gray-800 z-[120] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-black text-white">產品履歷詳情</h2>
           </div>
           <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
           {/* Summary Section */}
           <section className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                 {part.imageUrl ? (
                   <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                      <Package size={48} />
                      <p className="text-xs font-bold mt-2 uppercase tracking-widest">無產品圖</p>
                   </div>
                 )}
              </div>
              
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <Badge variant={isLowStock ? 'warning' : 'success'} className="uppercase text-[9px] px-2 py-0.5">
                       {isLowStock ? '庫存偏低' : '供給穩定'}
                    </Badge>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{part.category}</span>
                 </div>
                 <h3 className="text-2xl font-black text-white leading-tight">{part.name}</h3>
                 <p className="text-sm font-mono text-blue-500 font-bold mt-1">{part.id}</p>
              </div>
           </section>

           {/* Stats Grid */}
           <section className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f1115] border border-gray-800 p-4 rounded-2xl">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Package size={12} /> 當前在庫
                 </p>
                 <p className={`text-3xl font-black tabular-nums ${isLowStock ? 'text-rose-500' : 'text-gray-100'}`}>
                    {part.stock} <span className="text-xs text-gray-600">PCS</span>
                 </p>
              </div>
              <div className="bg-[#0f1115] border border-gray-800 p-4 rounded-2xl">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <DollarSign size={12} /> 零售單價
                 </p>
                 <p className="text-3xl font-black tabular-nums text-gray-100">
                    <span className="text-xs text-gray-600 italic">NT$</span> {part.price.toLocaleString()}
                 </p>
              </div>
           </section>

           {/* Fitment Info */}
           <section className="bg-gray-900/40 border border-dashed border-gray-800 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                 <Info size={12} /> 適用改裝車款
              </p>
              <div className="flex flex-wrap gap-2">
                 {part.fitment.map(f => (
                    <span key={f} className="px-3 py-1 bg-gray-800 text-gray-300 text-[10px] font-bold rounded-lg border border-gray-700">
                       {f}
                    </span>
                 ))}
              </div>
           </section>

           {/* Transaction History */}
           <section className="space-y-4 pb-10">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={14} className="text-blue-500" /> 近期進出履歷
                 </h4>
                 <span className="text-[10px] text-gray-600">{partTransactions.length} 筆紀錄</span>
              </div>
              
              <div className="space-y-3">
                 {partTransactions.length > 0 ? (
                    partTransactions.map(tr => (
                       <div key={tr.id} className="flex items-center justify-between p-3.5 bg-gray-900/60 border border-gray-800/80 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                ${tr.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}
                             `}>
                                {tr.type === 'IN' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                             </div>
                             <div>
                                <p className="text-[11px] font-bold text-gray-200">
                                   {tr.type === 'IN' ? '補貨入庫' : '銷售出庫'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                   <Calendar size={10} className="text-gray-600" />
                                   <p className="text-[9px] text-gray-600 font-bold tabular-nums">
                                      {new Date(tr.timestamp).toLocaleString()}
                                   </p>
                                </div>
                             </div>
                          </div>
                          <p className={`font-black text-lg tabular-nums ${tr.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {tr.type === 'IN' ? '+' : '-'}{tr.quantity}
                          </p>
                       </div>
                    ))
                 ) : (
                    <div className="py-10 text-center border border-dashed border-gray-800 rounded-2xl text-gray-600 text-[11px] font-bold">
                       未有任何異動紀錄
                    </div>
                 )}
              </div>
           </section>
        </div>
      </aside>
    </>
  );
};
