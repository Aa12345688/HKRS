import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Package } from "lucide-react";
import { ScannedItem } from "../../services/IngredientContext";

export function NeuralAnalyticsDashboard({ data, scannedItems }: { data: any[], scannedItems: ScannedItem[] }) {
    const [tab, setTab] = useState<"history" | "predict">("history");
    const [chartPage, setChartPage] = useState(0); 
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    
    const selectedRecord = useMemo(() => {
        return data.find(d => d.date === selectedDate) || null;
    }, [data, selectedDate]);
    
    const chartData = Array.isArray(data) ? data : [];
    const PAGE_SIZE = 7;
    const endIdx = chartData.length - (chartPage * PAGE_SIZE);
    const startIdx = Math.max(0, endIdx - PAGE_SIZE);
    const visibleData = chartData.slice(Math.max(0, startIdx), Math.max(0, endIdx));

    const expiringSoon = scannedItems.filter(i => {
        const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
        const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
        return daysLeft >= 0 && daysLeft <= 3 && !i.isSpoiled; 
    });

    const totalWaste = chartData.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const sustainabilityIndex = Math.max(0, 100 - (totalWaste * 2)); 
    const maxVal = Math.max(...chartData.map(d => Number(d.amount) || 0), 2);
    const chartHeight = 80;

    return (
        <div className="bg-card p-5 border-4 border-white mb-6 relative overflow-hidden group shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-20">
                <div>
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">食材損耗分析 (Waste Analytics)</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="text-xl font-black text-white tracking-tighter">{sustainabilityIndex}%</div>
                            <div className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">利用效率</div>
                        </div>
                        {expiringSoon.length > 0 && (
                         <div className="bg-amber-400/10 border-2 border-amber-400 px-2.5 py-1.5 flex flex-col shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                <div className="text-[9px] font-black text-amber-400 tracking-tighter">SAVINGS ${expiringSoon.length * 50}</div>
                                <div className="text-[6px] font-bold text-amber-400/60 uppercase">POTENTIAL</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex bg-black p-1 border-2 border-white/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <button onClick={() => setTab("history")} className={`px-4 py-1.5 text-[8px] font-black uppercase transition-all ${tab === "history" ? "bg-primary text-background border-2 border-black" : "text-gray-500"}`}>HISTORY</button>
                    <button onClick={() => setTab("predict")} className={`px-4 py-1.5 text-[8px] font-black uppercase transition-all ${tab === "predict" ? "bg-amber-400 text-background border-2 border-black" : "text-gray-500"}`}>PREDICTION</button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === "history" ? (
                    <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full">
                         <div className="flex items-center justify-between mb-2 px-1">
                            <button onClick={() => setChartPage(p => p + 1)} disabled={startIdx === 0} className={`p-1.5 border-2 border-white/20 transition-all ${startIdx === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'}`}><ChevronLeft size={16} className="text-white" /></button>
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{visibleData.length > 0 ? `${visibleData[0].date} ~ ${visibleData[visibleData.length-1].date}` : "NO DATA"}</span>
                            <button onClick={() => setChartPage(p => p - 1)} disabled={chartPage === 0} className={`p-1.5 border-2 border-white/20 transition-all ${chartPage === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'}`}><ChevronRight size={16} className="text-white" /></button>
                        </div>
                        <div className="h-[120px] w-full flex items-end justify-between px-2 pt-6 pb-2 relative">
                            {visibleData.length > 0 ? visibleData.map((d, i) => {
                                const height = (Number(d.amount) / maxVal) * chartHeight;
                                return (
                                    <div key={i} onClick={() => setSelectedDate(d.amount > 0 ? d.date : null)} className={`flex-1 flex flex-col items-center gap-2 group/bar relative cursor-pointer transition-transform ${selectedDate === d.date ? 'scale-110' : 'hover:scale-105'}`}>
                                         <div className="absolute top-0 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-4 group-hover/bar:-translate-y-2 flex flex-col items-center z-30">
                                            <span className="bg-primary text-background text-[8px] font-black px-2 py-1 border-2 border-black tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] whitespace-nowrap">WASTE {d.amount}</span>
                                            <div className="w-1.5 h-1.5 bg-primary -mt-0.5" />
                                        </div>
                                         <div className="relative w-full flex items-end justify-center">
                                            <motion.div initial={{ height: 0 }} animate={{ height: Math.max(2, height) }} className={`w-4 sm:w-6 transition-all duration-500 border-2 border-white/20 ${selectedDate === d.date ? 'bg-white brightness-150' : 'bg-red-500'}`} />
                                        </div>
                                        <span className={`text-[7px] font-black transition-colors ${selectedDate === d.date ? 'text-white underline' : 'text-gray-500 group-hover/bar:text-white'}`}>{(() => { const parts = d.date.split("-"); return `${Number(parts[1])}/${Number(parts[2])}`; })()}</span>
                                    </div>
                                );
                            }) : <div className="absolute inset-0 flex flex-col items-center justify-center pt-8"><div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">無可顯示之數據</div></div>}
                            <div className="absolute bottom-4 left-0 w-full h-[1px] bg-white/5 -z-10" />
                            <div className="absolute top-2 left-0 text-[7px] font-black text-gray-500/50 uppercase tracking-widest">週損耗趨勢報表</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="predict" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="py-2">
                         {(() => {
                            const total = scannedItems.length;
                            if (total === 0) return <div className="flex flex-col items-center justify-center py-6 text-center border-4 border-dashed border-white/10"><Package size={24} className="text-white/20 mb-3" /><p className="text-[9px] font-black text-white/30 uppercase tracking-widest">ADD ITEMS TO ENABLE PREDICTION</p></div>;
                            const riskItems = scannedItems.filter(i => { const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24)); const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed; return daysLeft > 0 && daysLeft <= 2 && !i.isSpoiled; });
                            const warningItems = scannedItems.filter(i => { const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24)); const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed; return daysLeft > 2 && daysLeft <= 5 && !i.isSpoiled; });
                            const safeItems = scannedItems.filter(i => { const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24)); const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed; return daysLeft > 5 && !i.isSpoiled; });
                            const getWidth = (val: number) => `${Math.max((val / total) * 100, 0)}%`;
                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mt-2 mb-2"><span className="text-[10px] font-black text-white uppercase tracking-widest">全庫存壽命分佈預測</span><span className="text-[8px] font-bold text-gray-500 uppercase">{total} ITEMS</span></div>
                                     <div className="w-full h-3 bg-black/40 border-2 border-white/10 overflow-hidden flex shadow-inner mb-4">
                                        {riskItems.length > 0 && <div style={{ width: getWidth(riskItems.length) }} className="bg-red-500 transition-all duration-1000 animate-pulse border-r-2 border-background" />}
                                        {warningItems.length > 0 && <div style={{ width: getWidth(warningItems.length) }} className="bg-amber-400 transition-all duration-1000 border-r-2 border-background" />}
                                        {safeItems.length > 0 && <div style={{ width: getWidth(safeItems.length) }} className="bg-primary transition-all duration-1000 border-r-2 border-background" />}
                                    </div>
                                     <div className="grid grid-cols-3 gap-2 relative z-10">
                                        <div className="bg-white/5 p-3 border-2 border-red-500/40 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"><div className="text-[8px] font-black text-gray-500 uppercase mb-1">HIGH RISK</div><div className="text-lg font-black text-red-500">{riskItems.length}</div><div className="text-[7px] text-gray-400 mt-1 uppercase">IMMEDIATE</div></div>
                                        <div className="bg-white/5 p-3 border-2 border-amber-400/40 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"><div className="text-[8px] font-black text-gray-500 uppercase mb-1">WARNING</div><div className="text-lg font-black text-amber-400">{warningItems.length}</div><div className="text-[7px] text-gray-400 mt-1 uppercase">PLANNING</div></div>
                                        <div className="bg-white/5 p-3 border-2 border-primary/40 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"><div className="text-[8px] font-black text-gray-500 uppercase mb-1">SAFE</div><div className="text-lg font-black text-primary">{safeItems.length}</div><div className="text-[7px] text-gray-400 mt-1 uppercase">STABLE</div></div>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                 {tab === "history" && selectedRecord && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t-2 border-white/10 bg-black/40 p-4 border-2 border-white/5">
                            <div className="flex items-center justify-between mb-3"><div className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-2"><Clock size={10} /> {selectedDate} LIST</div><button onClick={() => setSelectedDate(null)} className="text-[8px] font-black text-gray-500 uppercase">BACK</button></div>
                            <div className="flex flex-wrap gap-2">{selectedRecord.items?.map((item: string, idx: number) => (<div key={idx} className="bg-red-500/10 border-2 border-red-500/40 px-3 py-1.5 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"><div className="w-1.5 h-1.5 bg-red-500 animate-pulse" /><span className="text-[10px] font-black text-white uppercase">{item}</span></div>)) || <div className="text-[9px] text-gray-500 font-bold uppercase py-2">NO DATA</div>}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-center border-r border-white/10 pr-4"><div className="text-[10px] font-black text-white">{totalWaste}</div><div className="text-[6px] font-bold text-gray-500 uppercase">累積損耗</div></div>
                    <div><div className="text-[10px] font-black text-primary">{sustainabilityIndex}%</div><div className="text-[6px] font-bold text-gray-500 uppercase">環保等級 (Eco)</div></div>
                </div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Link: Active</div>
            </div>
        </div>
    );
}
