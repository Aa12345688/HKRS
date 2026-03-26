import { ChevronRight, Plus, Minus, X, Info, Sparkles, CheckCircle2 } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

/**
 * 掃描結果摘要面板 (DetectionSummary)
 * 轉型為「浮動底部彈窗」模式，避免在頁面切換時產生獨立頁面的錯覺。
 */
export function DetectionSummary({ readOnly = false }: { readOnly?: boolean }) {
    const { tempDetections, updateQuantity, removeItem, clearTempDetections, selectedIds, toggleSelection, updateSettings, t } = useIngredients();
    const navigate = useNavigate();

    // 當清單顯示時，告訴全域鎖定手勢
    useEffect(() => {
        if (tempDetections.length > 0 && !readOnly) {
            updateSettings({ isModalOpen: true });
        } else {
            updateSettings({ isModalOpen: false });
        }
        return () => updateSettings({ isModalOpen: false });
    }, [tempDetections.length, readOnly]);

    if (tempDetections.length === 0) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] pointer-events-none">
                {/* 背景遮罩 */}
                {!readOnly && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={clearTempDetections}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                    />
                )}

                {/* 彈窗主體 */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.1, ease: "linear" }}
                    className={`absolute bottom-0 left-0 right-0 max-h-[70vh] bg-card border-t-4 border-white pb-12 flex flex-col p-6 shadow-[0_-10px_0px_0px_rgba(0,0,0,0.5)] pointer-events-auto`}
                >
                    <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
                    
                    <div className="flex items-center justify-between mb-6 px-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center border-2 border-primary">
                                <Sparkles size={16} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">{t('scanner.list')} ({tempDetections.length})</h3>
                                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">{t('scanner.ai_results')}</p>
                            </div>
                        </div>
                        {!readOnly && (
                            <button onClick={clearTempDetections} className="p-2 border-2 border-white/20 text-gray-400 hover:text-white transition-all active:translate-x-[1px] active:translate-y-[1px]">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1 mb-6">
                        {tempDetections.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-background/40 border-2 ${selectedIds.includes(item.id) ? 'border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'border-white/10'} px-4 py-4 flex items-center justify-between transition-all`}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {!readOnly && (
                                        <button
                                            onClick={() => toggleSelection(item.id)}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-transparent border-white/20'}`}
                                        >
                                            {selectedIds.includes(item.id) && <CheckCircle2 size={16} className="text-background" strokeWidth={3} />}
                                        </button>
                                    )}
                                    <div className="min-w-0">
                                        <div className="text-sm font-black text-white uppercase truncate">{item.name}</div>
                                        <div className="text-[10px] font-bold text-primary opacity-60 uppercase tracking-widest">{item.category}</div>
                                    </div>
                                </div>

                                {readOnly ? (
                                    <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        <span className="text-xs font-black text-primary">x{item.quantity}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"><Minus size={14} strokeWidth={3} /></button>
                                        <span className="w-6 text-center font-black text-primary text-xs">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"><Plus size={14} strokeWidth={3} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!readOnly && (
                        <div className="grid grid-cols-2 gap-4 shrink-0 px-2 mt-auto">
                            <button onClick={clearTempDetections} className="py-4 bg-white/5 text-gray-400 border-2 border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/10 active:translate-x-[1px] active:translate-y-[1px] transition-all">{t('scanner.clear')}</button>
                            <button onClick={() => {
                                clearTempDetections();
                                navigate("/inventory");
                            }} className="py-4 bg-primary text-black border-4 border-black text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">{t('common.confirm')}</button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
