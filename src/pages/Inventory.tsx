import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, X, Filter, Printer, CheckSquare, Square } from 'lucide-react';
import { SearchInput } from '../components/molecules/SearchInput';
import { PartCard, PartItem } from '../components/molecules/PartCard';
import { Button } from '../components/atoms/Button';
import { ProductForm, ProductFormData } from '../components/organisms/ProductForm';
import { PartDetailDrawer } from '../components/organisms/PartDetailDrawer';
import { useInventoryStore } from '../store/useInventoryStore';

export const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Flagship features state
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const { parts, transactions, addPart } = useInventoryStore();

  const categories = useMemo(() => {
    const caps = new Set(parts.map(p => p.category));
    return Array.from(caps);
  }, [parts]);

  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.fitment.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [parts, searchTerm, selectedCategory]);

  const toggleBulkSelect = (id: string, isSelected: boolean) => {
    const newSet = new Set(bulkSelection);
    if (isSelected) newSet.add(id);
    else newSet.delete(id);
    setBulkSelection(newSet);
  };

  const handlePrintSelected = () => {
    if (bulkSelection.size === 0) return;
    const ids = Array.from(bulkSelection).join(',');
    navigate(`/bulk-print?ids=${ids}`);
  };

  const currentDetailPart = parts.find(p => p.id === selectedPartId) || null;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <header>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-1 h-3 bg-blue-600 rounded-full"></div>
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight text-white transition-all">產品目錄庫</h1>
          </div>
          <p className="text-gray-400 font-medium">即時管理 HKRS 全系列改裝零件與深度履歷</p>
        </header>
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={`w-full md:w-auto px-6 h-14 ${isBulkMode ? 'bg-blue-600 text-white' : 'text-gray-400 border-gray-800'}`}
          >
            {isBulkMode ? <CheckSquare size={18} className="mr-2" /> : <Square size={18} className="mr-2" />}
            {isBulkMode ? '關閉批量' : '批量選擇'}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setIsAddMode(true)}
            className="w-full md:w-auto px-6 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-xl"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} /> 新建規格
          </Button>
        </div>
      </div>

      {isBulkMode && bulkSelection.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0f1115] border border-blue-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 backdrop-blur-xl">
           <p className="text-sm font-black text-white px-4 border-r border-gray-800">
             已選擇 <span className="text-blue-500">{bulkSelection.size}</span> 項產品
           </p>
           <button 
             onClick={handlePrintSelected}
             className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-500 transition-all shadow-lg"
           >
             <Printer size={16} /> 批量列印條碼標籤
           </button>
           <button onClick={() => setBulkSelection(new Set())} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>
      )}

      <div className="bg-[#0f1115] border border-gray-800/80 rounded-3xl p-5 md:p-8 shadow-2xl space-y-8 min-h-[600px] w-full">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
          <div className="w-full xl:w-96">
            <SearchInput onSearch={setSearchTerm} className="shadow-inner" />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full no-scrollbar">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'}`}
            >
              全系列
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-4 5xl:grid-cols-5 gap-4 md:gap-12">
          {filteredParts.map(part => (
            <PartCard 
              key={part.id} 
              part={{...part, isSelected: bulkSelection.has(part.id)}} 
              selectable={isBulkMode}
              onSelect={(selected) => toggleBulkSelect(part.id, selected)}
              onClick={() => setSelectedPartId(part.id)}
            />
          ))}
        </div>
      </div>

      <PartDetailDrawer 
        part={currentDetailPart}
        transactions={transactions}
        onClose={() => setSelectedPartId(null)}
      />

      {isAddMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in" onClick={() => !isSubmitting && setIsAddMode(false)}></div>
          <div className="relative bg-[#0a0c10] border border-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8">
                <ProductForm onCancel={() => setIsAddMode(false)} onSubmit={() => setIsAddMode(false)} isLoading={isSubmitting} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
