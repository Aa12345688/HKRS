import React, { useState } from 'react';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface ProductFormData {
  id: string; // SKU ID
  name: string;
  category: string;
  fitment: string;
  safeStock: number;
  price: number;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData, imageFile: File | null) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    category: '',
    fitment: '',
    safeStock: 5,
    price: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Metadata */}
        <div className="space-y-5">
           <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2 font-mono">SKU ID (工廠條碼編號)</label>
            <input 
              required
              type="text" 
              placeholder="例如: HKRS-ACC-001"
              value={formData.id}
              onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
              className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">產品名稱</label>
            <input 
              required
              type="text" 
              placeholder="輸入產品完整名稱"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">類別</label>
              <select 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
              >
                <option value="">選擇類別</option>
                <option value="懸吊系統">懸吊系統</option>
                <option value="煞車系統">煞車系統</option>
                <option value="動力傳動">動力傳動</option>
                <option value="排氣系統">排氣系統</option>
                <option value="外觀精品">外觀精品</option>
                <option value="輪胎輪框">輪胎輪框</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">單價 (TWD)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2 font-mono">適用車款 (用逗號分隔)</label>
            <input 
              required
              type="text" 
              placeholder="勁戰六代, Force, AUGUR"
              value={formData.fitment}
              onChange={e => setFormData({...formData, fitment: e.target.value})}
              className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">缺貨警戒水位</label>
            <input 
              required
              type="number" 
              value={formData.safeStock}
              onChange={e => setFormData({...formData, safeStock: Number(e.target.value)})}
              className="w-full bg-[#050608] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Image Upload */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-1">產品示意圖</label>
          <div className={`relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 group
            ${previewUrl ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 hover:border-gray-600 bg-gray-900/40'}
          `}>
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-2xl" />
                <button 
                  type="button"
                  onClick={() => {setPreviewUrl(null); setImageFile(null);}}
                  className="absolute top-4 right-4 bg-rose-600 text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
                >
                  <AlertCircle size={18} strokeWidth={3} />
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <ImageIcon size={32} className="text-gray-500" />
                </div>
                <p className="text-sm font-bold text-gray-400">點擊或拖入圖片</p>
                <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-widest">JPG, PNG MAX 5MB</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </>
            )}
            
            <div className="absolute -bottom-3 right-4 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl">
               <Camera size={12} className="text-blue-500" />
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Studio Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="flex-1 order-2 sm:order-1"
          disabled={isLoading}
        >
          取消
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="flex-1 order-1 sm:order-2 h-14 bg-blue-600 hover:bg-blue-500"
          isLoading={isLoading}
        >
          <CheckCircle2 size={18} className="mr-2" strokeWidth={3} /> 
          {isLoading ? '處理中...' : '確認保存規格'}
        </Button>
      </div>
    </form>
  );
};
