import { X, ClipboardList } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddEntryFormProps {
    onAdd: (item: { 
        id: string; 
        name: string; 
        quantity: number; 
        category: string; 
        timestamp: number; 
        storageType: "fridge" | "freezer" 
    }) => void;
    onDismiss: () => void;
    categories: string[];
}

export function AddEntryForm({ onAdd, onDismiss, categories }: AddEntryFormProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [category, setCategory] = useState("蔬菜");
    const [storageType, setStorageType] = useState<"fridge" | "freezer">("fridge");

    const handleSubmit = () => {
        if (name.trim()) {
            const now = Date.now();
            onAdd({ 
                id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
                name: name.trim(), 
                quantity, 
                category,
                timestamp: now,
                storageType
            });
            setName("");
            setQuantity(1);
            onDismiss();
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                onPointerDown={(e) => e.stopPropagation()}
                className="bg-[#1a4d3d] w-[92vw] max-w-[420px] rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
            >
                <div className="absolute top-0 right-0 p-4 z-20">
                    <button onClick={onDismiss} className="w-[2.2rem] h-[2.2rem] rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                        <X style={{ width: '1.2rem', height: '1.2rem' }} />
                    </button>
                </div>

                <div className="px-[1.5rem] pt-[2rem] pb-[1rem] shrink-0 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-[3rem] h-[3rem] bg-primary/10 rounded-2xl flex items-center justify-center shadow-2xl border border-primary/20 shrink-0">
                            <ClipboardList style={{ width: '1.5rem', height: '1.5rem' }} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[1.2rem] font-black text-white uppercase tracking-tighter truncate">手動新增食材</h3>
                            <p className="text-[0.45rem] font-bold text-primary/60 uppercase tracking-widest mt-0.5 opacity-80">Manual Entry Interface</p>
                        </div>
                    </div>
                </div>

                <div className="px-[1.5rem] pb-[1rem] overflow-y-auto w-full no-scrollbar flex-1 space-y-6">
                    <div>
                        <label className="text-[0.63rem] font-black text-gray-500 uppercase tracking-widest mb-2 block">食材名稱 (Item Name)</label>
                        <input
                            type="text"
                            placeholder="例如：紅蘿蔔"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-sm focus:border-primary outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[0.63rem] font-black text-gray-500 uppercase tracking-widest mb-2 block">數量</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-sm focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[0.63rem] font-black text-gray-500 uppercase tracking-widest mb-2 block">分類 (Category)</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-sm focus:border-primary outline-none transition-all appearance-none"
                            >
                                {categories.filter(c => c !== "全部").map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[0.63rem] font-black text-gray-500 uppercase tracking-widest mb-2 block">儲存區域 (Storage)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setStorageType("fridge")}
                                className={`py-4 rounded-xl border text-[0.7rem] font-black uppercase transition-all ${storageType === 'fridge' ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-gray-400'}`}
                            >
                                冷藏庫
                            </button>
                            <button 
                                onClick={() => setStorageType("freezer")}
                                className={`py-4 rounded-xl border text-[0.7rem] font-black uppercase transition-all ${storageType === 'freezer' ? 'bg-blue-400 text-black border-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                            >
                                冷凍庫
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-[1.2rem] pt-0 shrink-0">
                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-primary text-black py-[0.8rem] rounded-[1.2rem] font-black uppercase text-[0.85rem] tracking-tight shadow-[0_10px_30px_rgba(0,255,136,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        確認載入庫存
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
