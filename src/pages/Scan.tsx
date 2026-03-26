import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScanLine, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertCircle, Camera, History, Volume2 } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { useInventoryStore } from '../store/useInventoryStore';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const Scan: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [mode, setMode] = useState<'IN' | 'OUT'>('OUT');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  
  const { parts, transactions, updateStock, scanMode } = useInventoryStore();

  // Voice Synthesis helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleScan = useCallback((e?: React.FormEvent, overrideBarcode?: string) => {
    if (e) e.preventDefault();
    const targetCode = overrideBarcode || barcode;
    if (!targetCode) return;
    
    setStatus('loading');
    
    setTimeout(() => {
      const part = parts.find(p => p.id === targetCode || p.name === targetCode);
      
      if (!part) {
        setStatus('error');
        const msg = `找不到對應產品`;
        setMessage(`${msg} (ID: ${targetCode})`);
        speak(`找不到對應產品`);
      } else {
        const amount = mode === 'IN' ? quantity : -quantity;
        const success = updateStock(part.id, amount, '現場掃描');
        
        if (success) {
          setStatus('success');
          const statusText = mode === 'IN' ? '補貨入庫' : '銷售出庫';
          setMessage(`${part.name} ${statusText} ${quantity} 組`);
          speak(`${part.name}，${statusText}成功`);
          
          setBarcode('');
          setQuantity(1);
          
          if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        } else {
          setStatus('error');
          const msg = `庫存不足，無法出庫`;
          setMessage(`${msg} (剩餘 ${part.stock})`);
          speak(msg);
        }
      }
      
      setTimeout(() => setStatus('idle'), 3000);
    }, 400);
  }, [barcode, mode, quantity, parts, updateStock, speak]);

  useEffect(() => {
    if (!showCamera) return;
    
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    
    scanner.render((decodedText) => {
      setBarcode(decodedText);
      setShowCamera(false);
      scanner.clear().catch(console.error);

      if (scanMode === 'auto') {
         setTimeout(() => handleScan(undefined, decodedText), 200);
      }
    }, (error) => {});

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [showCamera, scanMode, handleScan]);


  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-0">
      
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-white mb-1">倉儲作業中心</h1>
           <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">HKRS Terminal Mode</p>
        </div>
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-md">
           <Volume2 size={12} className="text-blue-500 animate-pulse" />
           <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Audio Assist Active</span>
        </div>
      </header>

      <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-gray-800/20 pointer-events-none z-0">
           <ScanLine size={300} strokeWidth={0.5} />
        </div>

        <div className="flex bg-[#050608] border border-gray-800/80 p-1.5 rounded-2xl mb-8 relative z-20 shadow-inner">
          <button 
            type="button"
            onClick={() => { setMode('OUT'); setStatus('idle'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-300 ${mode === 'OUT' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <ArrowUpFromLine size={18} strokeWidth={3} /> 產品出庫 (OUT)
          </button>
          <button 
            type="button"
            onClick={() => { setMode('IN'); setStatus('idle'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-300 ${mode === 'IN' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <ArrowDownToLine size={18} strokeWidth={3} /> 產品入庫 (IN)
          </button>
        </div>

        {showCamera && (
           <div className="mb-6 relative z-20">
              <div className="bg-black border-2 border-blue-500/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <div id="reader"></div>
              </div>
              <Button variant="ghost" className="w-full mt-4" onClick={() => setShowCamera(false)}>關閉鏡頭</Button>
           </div>
        )}

        {!showCamera && (
          <form onSubmit={handleScan} className="space-y-6 relative z-20">
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">等待掃描...</label>
                <button 
                   type="button" 
                   onClick={() => setShowCamera(true)}
                   className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all font-mono"
                >
                   <Camera size={14} /> CAMERA SCAN
                </button>
              </div>
              <input 
                type="text" 
                autoFocus
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="感應條碼" 
                className={`w-full bg-[#050608] border-2 rounded-2xl py-6 px-6 text-3xl font-mono font-black text-white focus:outline-none transition-all duration-300 shadow-inner
                  ${mode === 'OUT' ? 'border-gray-800 focus:border-rose-500/50' : 'border-gray-800 focus:border-emerald-500/50'}
                `}
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3 space-y-2">
                <label className="text-[10px] font-black text-gray-500 tracking-widest uppercase ml-1 block">數量</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-[#050608] border border-gray-800 rounded-2xl py-4 text-2xl font-black text-center text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              
              <div className="flex-1 flex items-end">
                <Button 
                  type="submit" 
                  disabled={!barcode || status === 'loading'}
                  isLoading={status === 'loading'}
                  className={`w-full h-[68px] text-lg font-black tracking-widest rounded-2xl shadow-xl transition-all duration-300
                    ${mode === 'OUT' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  確認操作
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className={`mt-8 rounded-2xl border p-5 flex items-start gap-4 transition-all duration-500 transform
          ${status === 'idle' || status === 'loading' ? 'opacity-0 translate-y-4 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'}
          ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
          ${status === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : ''}
        `}>
          {status === 'success' ? <CheckCircle2 size={28} className="shrink-0" /> : <AlertCircle size={28} className="shrink-0" />}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-1">{status === 'success' ? '掃描成功' : '系統異常'}</h4>
            <p className="text-sm font-bold leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
         <h3 className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <History size={14} className="text-gray-700" /> RECENT AUDIT LOGS
            </div>
         </h3>
         <div className="space-y-3">
            {transactions.length > 0 ? (
               transactions.slice(0, 5).map(tr => (
                 <div key={tr.id} className="flex items-center justify-between p-4 bg-[#0f1115] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-4 text-sm">
                       <div className={`p-2 rounded-lg font-black text-[10px] ${tr.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {tr.type}
                       </div>
                       <div>
                          <p className="text-white font-bold">{tr.partName}</p>
                          <p className="text-[9px] text-gray-700 mt-0.5 tracking-tighter uppercase font-bold">{new Date(tr.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-xl font-black tabular-nums ${tr.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tr.type === 'IN' ? '+' : '-'}{tr.quantity}
                       </p>
                    </div>
                 </div>
               ))
            ) : (
               <div className="py-14 text-center border border-dashed border-gray-800 rounded-3xl opacity-10">
                  <ScanLine size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-black tracking-widest uppercase">READY</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
