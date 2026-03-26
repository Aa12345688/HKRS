import { CheckCircle2 } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";

interface IngredientChecklistProps {
    ingredients: string[];
    checkedItems: boolean[];
    onToggle: (index: number) => void;
    progress: number;
}

export function IngredientChecklist({
    ingredients,
    checkedItems,
    onToggle,
    progress
}: IngredientChecklistProps) {
    const { t } = useIngredients();
    return (
        <div className="mb-10 bg-[#1a4d3d] p-8 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)]">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                {t('recipes.checklist')}
            </h3>

            <div className="space-y-4">
                {Array.isArray(ingredients) && ingredients.map((ingredient, index) => (
                    <button
                        key={index}
                        onClick={() => onToggle(index)}
                        className="w-full flex items-center gap-4 group text-left active:translate-x-[1px] active:translate-y-[1px]"
                    >
                        <div className="flex-shrink-0">
                            {checkedItems[index] ? (
                                <div className="w-6 h-6 bg-primary border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                    <CheckCircle2 size={16} className="text-[#0f2e24]" strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="w-6 h-6 border-2 border-white/20 group-hover:border-primary/50 transition-colors" />
                            )}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-tight transition-all ${checkedItems[index] ? 'text-white/20 line-through' : 'text-white'}`}>
                            {ingredient}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-white/10">
                <div className="flex justify-between items-end mb-3 px-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('recipes.prep_progress')}</span>
                    <span className="text-xs font-black text-primary">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 p-0.5 border-2 border-white/10">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
