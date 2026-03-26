import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { useIngredients } from "../services/IngredientContext";
import { DetectionRow } from "../components/inventory_management/DetectionRow";

export function Ingredients() {
    const navigate = useNavigate();
    const { scannedItems, updateQuantity, removeItem, clearAll } = useIngredients();
    
    return (
        <div className="pb-32 pt-6 relative">
            {/* Minimal Floating Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="fixed top-[1rem] left-[1rem] z-[110] w-[2.5rem] h-[2.5rem] bg-card border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
                <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} className="text-white" />
            </button>

            <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary" />
                        SCAN LOGS
                    </h2>
                    <button 
                        onClick={clearAll} 
                        className="p-[0.5rem] bg-red-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                        <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                    </button>
                </div>

                {scannedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border-4 border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                        <div className="relative mb-[2rem] group">
                            <div className="relative w-[6rem] h-[6rem] bg-card border-4 border-primary flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)]">
                                <Plus style={{ width: '2rem', height: '2rem' }} className="text-primary/50" />
                            </div>
                        </div>
                        <h3 className="text-[0.85rem] font-black text-white/30 uppercase tracking-widest mb-6 px-4">MEMORY EMPTY: NO DATA DETECTED</h3>
                        <button 
                            onClick={() => navigate("/")} 
                            className="flex items-center gap-3 bg-primary text-black px-10 py-5 border-4 border-black font-black uppercase text-[0.65rem] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                        >
                            ACTIVATE SENSOR
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scannedItems.slice(0, 10).map((item) => (
                            <DetectionRow 
                                key={item.id} 
                                item={item} 
                                onUpdate={updateQuantity} 
                                onRemove={removeItem} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
