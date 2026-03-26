import React, { useState } from 'react';
import { BarcodeGenerator } from '../components/organisms/BarcodeGenerator';
import { Layout } from '../components/templates/Layout';
import { Printer, Tag, Package, Calendar } from 'lucide-react';

export const BarcodeTestPage: React.FC = () => {
  const [sku, setSku] = useState('HKRS-SUS-001');
  const [lot, setLot] = useState('BATCH-202403-A');
  const [qty, setQty] = useState(20);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="no-print">
        <h1 className="text-3xl font-black text-white mb-2">條碼標籤生成測試系統</h1>
        <p className="text-gray-400">輸入商品資訊以即時預覽 Code 128 與 QR Code 標籤效果</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form - Hidden when printing */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 no-print">
          <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2 mb-4">
             <Tag size={20} className="text-blue-500" /> 標籤參數設定
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">商品 SKU 編號</label>
              <input 
                type="text" 
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">進貨批號 (Lot Number)</label>
              <input 
                type="text" 
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">數量 (Qty)</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="number" 
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#050608] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">進貨日期</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#050608] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
             <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-2 italic underline text-center">💡 專業建議</p>
                <ul className="text-xs text-blue-200/60 leading-relaxed list-disc list-inside space-y-1">
                   <li>Code 128 條碼非常適合給店內的手持紅外線掃描槍讀取 SKU。</li>
                   <li>QR Code 則是設計給倉儲進貨點數使用，掃描後可直接獲得批號與數量。</li>
                 </ul>
             </div>
          </div>
        </div>

        {/* Live Preview Area - Visible in print but no header */}
        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-3xl border border-gray-100 shadow-inner relative overflow-hidden min-h-[500px] print:bg-white print:border-none print:shadow-none print:p-0">
           <div className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 font-bold text-[10px] tracking-widest uppercase mb-4 no-print">
              <Printer size={14} /> 即時列印預覽區域 (Live Preview)
           </div>
           
           <BarcodeGenerator 
             skuCode={sku}
             batchInfo={{ lot, qty, arrivalDate: date }}
           />
        </div>
      </div>
    </div>
  );
};
