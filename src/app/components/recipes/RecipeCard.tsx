import { Clock, TrendingUp, ChevronRight, Leaf } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";

interface RecipeCardProps {
    recipe: any;
    onClick: () => void | Promise<void>;
    getCategoryLabel?: (cat: string) => string;
}

/**
 * 食譜卡片組件 (RecipeCard)
 * 負責渲染在「AI 食譜推薦列表」中的單一食譜預覽圖文框。
 */
export function RecipeCard({ recipe, onClick, getCategoryLabel }: RecipeCardProps) {
    const { t } = useIngredients();
    const handleCardClick = () => {
        // ✨ 精英級手機震動回饋 (Haptic Feedback)
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // 10ms 極短震動，模擬機械手感
        }
        onClick();
    };

    const displayCategory = getCategoryLabel 
        ? getCategoryLabel(recipe.category) 
        : (recipe.category === "vegetable" ? "VEGAN" : recipe.category === "fruit" ? "FRUIT" : recipe.category === "meat" ? "MEAT" : "MISC");

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] border-4 border-white/10 transition-all cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-2 performance-layer"
        >
            {/* Square Image Container */}
            <div className="relative w-full aspect-square overflow-hidden shadow-lg bg-white/5 border-2 border-white/5">
                <img
                    src={recipe.image}
                    alt={recipe.name}
                    loading="lazy"
                    onLoad={(e) => {
                        e.currentTarget.style.opacity = "1";
                    }}
                    style={{ opacity: 0, imageRendering: 'pixelated' }}
                    className="w-full h-full object-cover transition-none"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Match Score Badge (Inside Image) */}
                <div className="absolute top-1 right-1 bg-black/60 p-1 border-2 border-primary flex flex-col items-center min-w-[32px] shadow-lg backdrop-blur-sm">
                    <span className="text-[9px] font-black text-primary">{recipe.matchScore}%</span>
                    <span className="text-[4px] font-black text-white/40 uppercase tracking-tighter">{t('recipes.match')}</span>
                </div>

                {/* Sustainability Badge */}
                {recipe.sustainabilityTip && (
                    <div className="absolute top-1 left-1 bg-primary px-1.5 py-1 flex items-center gap-1 shadow-lg border-2 border-black">
                        <Leaf size={10} className="text-[#0f2e24]" fill="currentColor" />
                        <span className="text-[8px] font-black text-[#0f2e24] uppercase tracking-tighter">{t('recipes.eco')}</span>
                    </div>
                )}
            </div>

            <div className="w-full px-1">
                <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="bg-primary text-[#0f2e24] text-[6px] font-black px-1.5 py-0.5 uppercase tracking-widest border-2 border-black">
                            {t('recipes.reco')}
                        </div>
                        <div className="text-white/30 text-[5px] font-black uppercase">
                            {displayCategory}
                        </div>
                    </div>
                    
                    <h3 className="font-black text-[10px] text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[24px]">{recipe.name}</h3>
                </div>

                <div className="flex items-center justify-between mb-2 text-[6px] font-black text-white/30 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Clock size={8} className="text-primary/60" />
                            <span>{recipe.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={8} className="text-primary/60" />
                            <span>{recipe.difficulty}</span>
                        </div>
                    </div>
                </div>

                <button
                    className="w-full bg-primary text-[#0f2e24] py-1.5 border-4 border-black font-black text-[8px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-1"
                >
                    <span>{t('recipes.cook')}</span>
                    <ChevronRight size={10} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
