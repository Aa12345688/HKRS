import React, { useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { Printer, ArrowLeft, Package, LayoutGrid } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { BarcodeGenerator } from '../components/organisms/BarcodeGenerator';
import { useInventoryStore } from '../store/useInventoryStore';

export const BulkPrintPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { parts } = useInventoryStore();

  const queryParams = new URLSearchParams(location.search);
  const idsString = queryParams.get('ids') || '';
  const selectedIds = useMemo(() => idsString.split(',').filter(id => id), [idsString]);

  const selectedParts = useMemo(() => {
    return parts.filter(p => selectedIds.includes(p.id));
  }, [parts, selectedIds]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (selectedParts.length === 0 && idsString) {
      // Maybe data not loaded yet or invalid IDs
    }
  }, [selectedParts]);

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 border-dashed">
           <Package size={32} className="text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-300">未選擇任何產品</h2>
        <p className="text-gray-500 max-w-xs">請先回目錄勾選需要列印標籤的零件。</p>
        <Link to="/inventory">
          <Button variant="primary">回到產品目錄</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Back Header - Hidden when printing */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors font-bold text-xs uppercase tracking-widest mb-2"
           >
             <ArrowLeft size={16} /> 回到目錄
           </button>
           <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Printer size={28} className="text-blue-500" /> 批量標籤預覽
           </h1>
           <p className="text-gray-400 font-medium mt-1">即將列印 {selectedParts.length} 項產品標籤</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => window.location.reload()} className="bg-gray-900 border-gray-800">
             刷新排版
          </Button>
          <Button variant="primary" onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 px-8 h-14 shadow-xl">
             <Printer size={20} className="mr-2" strokeWidth={3} /> 立即列印 (Ctrl+P)
          </Button>
        </div>
      </header>

      {/* Printing Surface */}
      <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-8 shadow-2xl print:bg-white print:border-none print:p-0 print:shadow-none min-h-[80vh]">
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4 print:block">
            {selectedParts.map(part => (
              <div key={part.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all print:border-black print:rounded-none print:mb-8 print:p-4 print:page-break-inside-avoid">
                 <div className="mb-4 flex justify-between items-start print:hidden">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded uppercase">{part.category}</span>
                    <LayoutGrid size={14} className="text-gray-700" />
                 </div>
                 <BarcodeGenerator skuCode={part.id} />
                 <div className="mt-4 pt-4 border-t border-gray-800/50 print:border-black/20">
                    <p className="text-xs font-bold text-gray-400 truncate print:text-black">{part.name}</p>
                    <div className="flex justify-between items-center mt-1">
                       <p className="text-[10px] text-gray-600 font-mono print:text-black">Fit: {part.fitment.slice(0, 2).join(', ')}</p>
                       <p className="text-sm font-black text-white print:text-black">NT$ {part.price.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Print Instructions */}
      <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 print:hidden">
         <h3 className="text-sm font-black text-blue-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
            <Info size={16} /> 列印提示
         </h3>
         <p className="text-xs text-blue-200/60 leading-relaxed font-bold">
            如果您使用的是專用標籤機，請在列印對話框中將 **「邊距」** 設為 **「無」**，並確保縮放比例為 **「實際大小 (100%)」** 以獲得最佳掃描效果。
         </p>
      </div>
    </div>
  );
};

const Info: React.FC<{size?: number}> = ({size=16}) => <LayoutGrid size={size} />;
