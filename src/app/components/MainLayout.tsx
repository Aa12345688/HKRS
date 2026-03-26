import { Outlet, useLocation, useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "../services/IngredientContext";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

/**
 * 主佈局組件 (Main Layout)
 * 這是整個應用的核心外框，所有分頁(Outlet)都會在這個佈局內被渲染。
 */

function hexToRgbValues(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : 
        [0, 255, 136];
}

function hexToRgb(hex: string) {
    const [r, g, b] = hexToRgbValues(hex);
    return `${r}, ${g}, ${b}`;
}

function generateAtmosphere(primaryHex: string) {
    const [r, g, b] = hexToRgbValues(primaryHex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isLight = luminance > 0.7;

    if (isLight) {
        return { bg: "#ffffff", surface: "#f8f8f8", header: "#f0f0f0", light: true };
    }

    const darken = (val: number, factor: number) => Math.floor(val * factor);
    
    return {
        bg: `rgb(${darken(r, 0.08)}, ${darken(g, 0.08)}, ${darken(b, 0.08)})`,
        surface: `rgb(${darken(r, 0.15)}, ${darken(g, 0.15)}, ${darken(b, 0.15)})`,
        header: `rgb(${darken(r, 0.05)}, ${darken(g, 0.05)}, ${darken(b, 0.05)})`,
        light: false
    };
}

const STATIC_PALETTES: Record<string, any> = {
    "#00ff88": { name: "Neural Mint", bg: "#061a14", surface: "#0d2e24", header: "#04120e" },
    "#007aff": { name: "Arctic Blue", bg: "#040a1a", surface: "#0d1b3d", header: "#020612" },
    "#ff8800": { name: "Cyber Orange", bg: "#0d0a05", surface: "#1a140a", header: "#000000" },
    "#af52ff": { name: "Neural Purple", bg: "#0a0510", surface: "#140a20", header: "#000000" },
    "#d4af37": { name: "Royal Gold", bg: "#ffffff", surface: "#f8f8f8", header: "#f0f0f0", light: true },
    "#ff0000": { name: "Crimson Node", bg: "#0a0000", surface: "#1a0505", header: "#000000" }
};

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useIngredients();
    const [calculatedScale, setCalculatedScale] = useState(settings.uiScale || 1.0);
    const [toast, setToast] = useState<{ title: string, body: string } | null>(null);

    useEffect(() => {
        const updateScale = () => {
            const autoValue = window.innerWidth < 430 
                ? Math.max(0.8, window.innerWidth / 430)
                : Math.min(1.1, window.innerWidth / 430);

            const targetScale = settings.autoScale ? autoValue : (settings.uiScale || 1.0);
            setCalculatedScale(targetScale);
            document.documentElement.style.setProperty('--zoom-factor', targetScale.toString());
        };

        updateScale();
        if (settings.autoScale) {
            window.addEventListener('resize', updateScale);
            return () => window.removeEventListener('resize', updateScale);
        }
    }, [settings.autoScale, settings.uiScale]);

    const tabs = ["/", "/inventory", "/recipes", "/saved", "/profile"];
    const currentIndex = tabs.findIndex(t => t === "/" ? location.pathname === "/" : location.pathname.startsWith(t));

    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const threshold = 50;
        if (info.offset.x > threshold && currentIndex > 0) {
            navigate(tabs[currentIndex - 1]);
        } else if (info.offset.x < -threshold && currentIndex < tabs.length - 1 && currentIndex !== -1) {
            navigate(tabs[currentIndex + 1]);
        }
    };

    useEffect(() => {
        const handleNotification = (e: any) => {
            setToast({ title: e.detail.title, body: e.detail.body });
            setTimeout(() => setToast(null), 5000);
        };
        window.addEventListener('app-notification', handleNotification);
        return () => window.removeEventListener('app-notification', handleNotification);
    }, []);

    const activeColor = settings.themeColor || "#00ff88";
    const atmosphere = STATIC_PALETTES[activeColor] || generateAtmosphere(activeColor);

    useEffect(() => {
        const main = document.querySelector('main');
        if (main) main.scrollTop = 0;
    }, [location.pathname]);

    return (
        <div className={`min-h-screen flex justify-center w-full overflow-hidden ${!settings.darkMode ? 'light-theme' : ''}`} style={{ backgroundColor: settings.mainBg || atmosphere.bg }}>
            <div 
                className="w-full max-w-[430px] h-[100dvh] relative flex flex-col shadow-2xl overflow-hidden filter-theme origin-top"
                style={{ 
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    '--primary': activeColor,
                    '--primary-rgb': hexToRgb(activeColor),
                    '--primary-glow': `${activeColor}40`,
                    '--background': settings.mainBg || atmosphere.bg,
                    '--card': settings.subBg || atmosphere.surface,
                    '--header-bg': atmosphere.header,
                    '--foreground': atmosphere.light ? "#1a4d3d" : "#ffffff"
                } as any}
            >
                <div className="grid-bg" />
                <div className="crt-overlay" />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth relative" style={{ backgroundColor: 'var(--background)' }}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={location.pathname}
                            drag={settings.isModalOpen ? false : "x"}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            dragListener={!settings.isModalOpen}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, position: "absolute", top: 0, left: 0, width: "100%" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="min-h-full w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <BottomNav />

                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-[9999] pointer-events-none"
                            transition={{ duration: 0.1, ease: "linear" }}
                        >
                            <div className="bg-[#1a4d3d] border-4 border-red-500 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.6)] flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center shrink-0 border-2 border-red-500">
                                    <Bell size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-red-500 font-black text-[12px] uppercase mb-1">{toast.title}</h4>
                                    <p className="text-xs text-white font-bold leading-relaxed">{toast.body}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
