import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, BookOpen, Trash2 } from "lucide-react";
import { useIngredients } from "../services/IngredientContext";
import { NeuralAnalyticsDashboard } from "../components/analytics/NeuralAnalyticsDashboard";
import { RecipeCard } from "../components/recipes/RecipeCard";

export function Saved() {
    const nav = useNavigate();
    const { wasteHistory, scannedItems, savedRecipes, unsaveRecipe, t } = useIngredients();

    return (
        <div className="pb-28 pt-6 relative">
            <button 
                onClick={() => nav(-1)} 
                className="fixed top-[1rem] left-[1rem] z-[110] w-[2.5rem] h-[2.5rem] bg-card border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
                <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} className="text-white" />
            </button>
            <div className="px-6 mb-8 mt-2 text-left">
                <NeuralAnalyticsDashboard data={wasteHistory} scannedItems={scannedItems} />
            </div>

             {savedRecipes.length === 0 ? (
                <div className="px-4 flex flex-col items-center justify-center py-10 text-center bg-white/5 border-4 border-white/10 mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="w-[4rem] h-[4rem] bg-primary/5 border-4 border-primary/20 flex items-center justify-center mb-4">
                        <BookOpen style={{ width: '1.75rem', height: '1.75rem' }} className="text-primary/40" />
                    </div>
                    <h2 className="text-[0.63rem] font-black text-white/50 uppercase mb-4 tracking-widest">{t('saved.no_recipes')}</h2>
                    <button 
                        onClick={() => nav("/")} 
                        className="bg-primary text-black px-8 py-4 border-4 border-black font-black uppercase text-[0.65rem] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                    >
                        {t('saved.return_scanner')}
                    </button>
                </div>
            ) : (
                 <div className="px-4 space-y-3">
                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">{t('saved.collection')} ({savedRecipes.length})</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {savedRecipes.map((recipe) => (
                            <div key={recipe.id} className="relative group">
                                <RecipeCard recipe={recipe} onClick={() => nav(`/recipe/${recipe.id}`)} getCategoryLabel={(c) => c === "vegetable" ? "VEG" : c === "fruit" ? "FRUIT" : c === "meat" ? "MEAT" : "MISC"} />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); unsaveRecipe(recipe.id); }} 
                                    className="absolute top-[1rem] right-[1rem] z-30 w-[2.2rem] h-[2.2rem] bg-red-500 text-white border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                >
                                    <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
