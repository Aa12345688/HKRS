import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, ChefHat, Palette, Settings, Bell, HelpCircle, ChevronRight, LogOut, ChevronLeft } from "lucide-react";
import { useIngredients } from "../services/IngredientContext";
import { llmService } from "../services/llmService";
import { SettingsModal } from "../components/profile/SettingsModal";

export function Profile() {
    const { settings, updateSettings, clearAll, clearInventory, clearWasteHistory, resetSettings, t } = useIngredients();
    const nav = useNavigate();
    const [apiStatus, setApiStatus] = useState<{ status: 'online' | 'offline' | 'no_key', model: string, keyCount: number } | null>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        const check = async () => {
            const status = await llmService.testConnection();
            setApiStatus(status);
        };
        check();
    }, []);

    const settingsGrid = [
        { id: 'api', label: t('profile.api'), desc: "API & Model", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
        { id: 'dietary', label: t('profile.dietary'), desc: "Preferences", icon: ChefHat, color: "text-primary", bg: "bg-primary/10" },
        { id: 'theme', label: t('profile.theme'), desc: "Premium Theme", icon: Palette, color: "text-rose-400", bg: "bg-rose-500/10" },
        { id: 'display', label: t('profile.display'), desc: "UI Scaling", icon: Settings, color: "text-blue-400", bg: "bg-blue-500/10" },
        { id: 'system', label: t('profile.system'), desc: "System", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
        { id: 'data', label: t('profile.data'), desc: "Data Core", icon: LogOut, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    return (
        <div className="pb-28 px-6 pt-6 relative min-h-screen">
            <button onClick={() => nav(-1)} className="fixed top-[1rem] left-[1rem] z-[110] w-[2.5rem] h-[2.5rem] bg-card border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-white">
                <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <h2 className="text-center text-[0.5rem] font-black text-white/10 uppercase tracking-[0.4em] mb-6">Neural Core Interface</h2>
            
            <div className="flex flex-col items-center mb-8">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-card border-4 border-primary flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)] mb-4 relative group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all" />
                    <User size={40} className="text-primary relative z-10" strokeWidth={1} />
                </motion.div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1.5 font-pixel">ADMIN PANEL</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border-2 border-primary"><div className="w-1.5 h-1.5 bg-primary animate-pulse" /><span className="text-[0.63rem] font-black text-primary uppercase tracking-widest">{t('profile.certified')}</span></div>
            </div>

            <div 
                className="grid gap-3 mb-8"
                style={{ 
                    // 核心排列邏輯：按鈕縮小時，一行可以塞更多；按鈕放大時，自動換行
                    gridTemplateColumns: `repeat(auto-fit, minmax(calc(120px * var(--zoom-factor, 1)), 1fr))` 
                }}
            >
                {settingsGrid.map((item) => (
                    <motion.button 
                        key={item.id} 
                        whileTap={{ scale: 0.98 }} 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                            setActiveModal(item.id);
                            updateSettings({ isModalOpen: true });
                        }} 
                        className="p-4 bg-card border-2 border-white/10 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] group transition-all relative z-10 gap-3 hover:border-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        <div className={`w-12 h-12 ${item.bg} flex items-center justify-center border-2 border-white/5 group-hover:border-primary transition-all shrink-0`}>
                            <item.icon style={{ width: '1.4rem', height: '1.4rem' }} className={item.color} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[0.63rem] font-black text-white uppercase tracking-wider truncate">{item.label}</div>
                            <div className="text-[0.44rem] font-bold text-gray-500 uppercase tracking-widest mt-0.5 truncate">{item.desc}</div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <button onClick={() => nav("/saved")} className="w-full flex items-center justify-between p-5 bg-white/5 border-2 border-white/10 hover:bg-white/10 transition-all mb-4 group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-amber-400/10 flex items-center justify-center border-2 border-amber-400"><HelpCircle size={24} className="text-amber-400" /></div><div><div className="text-xs font-black text-white uppercase tracking-wider text-left">{t('profile.analytics')}</div><div className="text-[0.5rem] font-bold text-gray-500 uppercase tracking-widest mt-0.5 text-left">{t('profile.analytics_desc')}</div></div></div>
                <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-all" />
            </button>

            <AnimatePresence>{activeModal && (<SettingsModal type={activeModal} onClose={() => {
                setActiveModal(null);
                updateSettings({ isModalOpen: false });
            }} settings={settings} updateSettings={updateSettings} apiStatus={apiStatus} onClearInventory={clearInventory} onClearWaste={clearWasteHistory} onResetSettings={resetSettings} onClearAll={clearAll} t={t} />)}</AnimatePresence>
            <div className="text-center mt-12 opacity-20"><div className="text-[0.5rem] font-black text-white uppercase tracking-[0.5em]">KITCHEN AI v1.6.0 / ELITE CORE</div></div>
        </div>
    );
}
