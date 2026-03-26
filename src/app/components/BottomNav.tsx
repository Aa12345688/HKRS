import { Camera, Sparkles, BookOpen, User, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useIngredients } from "../services/IngredientContext";

/**
 * BottomNav (底部導覽列組件)
 * 負責在整個應用程式下方渲染五個主要分頁的切換按鈕。
 * 
 * 功能亮點：
 * 1. 使用 `react-router` 的 `useLocation` 及 `useNavigate` 判斷當前所在路徑與執行跳轉。
 * 2. 結合賽博龐克主題風格的 UI，點擊時會具備發光 (var(--primary)) 與縮放動畫。
 * 3. 處理手機版友善的安全邊距，將其浮動在畫面的最下層並加上玻璃透視背景 (backdrop-blur)。
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useIngredients();

  const navItems = [
    { icon: Camera, label: t('nav.scan'), path: "/" },
    { icon: Package, label: t('nav.inventory'), path: "/inventory" },
    { icon: Sparkles, label: t('nav.recipes'), path: "/recipes" },
    { icon: BookOpen, label: t('nav.saved'), path: "/saved" },
    { icon: User, label: t('nav.profile'), path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[420px] pointer-events-none">
      <div className="w-full bg-card border-4 border-white/20 p-1 flex justify-around items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.6)] pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 transition-all duration-75 group ${isActive ? "text-primary bg-white/5" : "text-white/40 hover:text-white"
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 border-b-4 border-primary animate-in fade-in duration-75" />
              )}
              <Icon size={18} strokeWidth={isActive ? 3 : 2} className="relative z-10" />
              <span className={`text-[8px] font-black tracking-tighter relative z-10 transition-all ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}