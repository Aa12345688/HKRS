import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, ChefHat, Users, RefreshCw, Leaf, Sparkles, BookOpen, X, Trash2 } from "lucide-react";
import { useIngredients } from "../services/IngredientContext";
import { llmService } from "../services/llmService";
import { recipeDatabase } from "../data/recipes";
import { RecipeHero } from "../components/recipes/RecipeHero";
import { IngredientChecklist } from "../components/recipes/IngredientChecklist";
import { CookingProtocol } from "../components/recipes/CookingProtocol";

export function RecipeDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const { recommendedRecipes, scannedItems, setRecipes, saveRecipe, savedRecipes, t } = useIngredients();
    const [showSaveModal, setShowSaveModal] = useState(false);

    const recipe = recommendedRecipes.find(r => r.id === id) ||
        recipeDatabase.find(r => r.id === id) ||
        savedRecipes.find(r => r.id === id) ||
        {
            name: "AI 合成食譜",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
            time: "15 分鐘",
            difficulty: "簡單",
            requiredIngredients: ["番茄", "菠菜"],
            optionalIngredients: [],
            description: "智慧生成食譜。"
        };

    const [checked, setChecked] = useState<boolean[]>([]);
    
    useEffect(() => {
        if (recipe && recipe.requiredIngredients) {
            setChecked(new Array(recipe.requiredIngredients.length).fill(false));
        }
    }, [recipe]);

    return (
        <div className="pb-32 pt-0 relative">
            <button 
                onClick={() => nav(-1)} 
                className="fixed top-4 left-4 z-[110] w-10 h-10 bg-[#0d231b] border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-white"
            >
                <ChevronLeft size={20} />
            </button>
            <RecipeHero image={recipe.image} name={recipe.name} />
            <div className="px-6 py-6">
                 <div className="grid grid-cols-3 gap-3 mb-8">
                    {[{ i: Clock, v: recipe.time }, { i: ChefHat, v: recipe.difficulty }, { i: Users, v: t('recipes.servings', { 1: "2-3" }) }].map((s, i) => (
                        <div key={i} className="bg-white/5 border-2 border-white/20 p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                            <s.i className="w-4 h-4 mx-auto mb-2 text-primary" />
                            <div className="text-[10px] font-black text-white uppercase">{s.v}</div>
                        </div>
                    ))}
                </div>

                 {(recipe.sustainabilityTip || recipe.substitutionTip) && (
                    <div className="mb-8 space-y-3">
                        {recipe.substitutionTip && (
                            <div className="bg-amber-400/10 border-4 border-amber-400 p-4 flex gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
                                <RefreshCw size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">{t('recipes.substitution_advice')}</div>
                                    <p className="text-[11px] text-white/70 leading-relaxed font-bold uppercase">{recipe.substitutionTip}</p>
                                </div>
                            </div>
                        )}
                        {recipe.sustainabilityTip && (
                            <div className="bg-primary/10 border-4 border-primary p-4 flex gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
                                <Leaf size={16} className="text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t('recipes.zero_waste_protocol')}</div>
                                    <p className="text-[11px] text-white/70 leading-relaxed font-bold uppercase">{recipe.sustainabilityTip}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <IngredientChecklist ingredients={recipe.requiredIngredients} checkedItems={checked} onToggle={(i) => { const n = [...checked]; n[i] = !n[i]; setChecked(n); }} progress={Math.round((checked.filter(Boolean).length / recipe.requiredIngredients.length) * 100)} />
                <CookingProtocol steps={recipe.steps || [{ title: "初始化", description: "準備食材。" }, { title: "執行", description: "標準烹飪。" }]} />

                 <div className="mt-12 mb-8 px-2">
                    <button
                        onClick={async () => {
                            try {
                                const ingredientsToUse = scannedItems.map(i => i.name);
                                const res = await llmService.generateRecipes({ ingredients: ingredientsToUse });
                                setRecipes(res);
                                alert(t('recipes.alert_new_protocol'));
                            } catch (e: any) {
                                alert(t('recipes.alert_synthesis_failed'));
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 border-4 border-white py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/10 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none text-center"
                    >
                        <Sparkles size={18} />
                        {t('recipes.reanalyze')}
                    </button>
                </div>

                <button 
                    onClick={() => {
                        saveRecipe(recipe);
                        setShowSaveModal(true);
                    }} 
                    className={`w-full py-5 border-4 font-black text-sm uppercase flex items-center justify-center gap-3 mt-4 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${savedRecipes.find(r => r.id === recipe.id) ? 'bg-white/10 text-white border-white/20' : 'bg-primary text-background border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]'}`}
                >
                    <BookOpen size={20} />
                    {savedRecipes.find(r => r.id === recipe.id) ? t('recipes.stored') : t('recipes.store')}
                </button>
            </div>

             <AnimatePresence>
                {showSaveModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 pb-[15vh] sm:pb-6">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#1a4d3d] w-full max-w-sm max-h-[75vh] flex flex-col border-4 border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.6)] relative overflow-hidden">
                            <button onClick={() => setShowSaveModal(false)} className="absolute right-4 top-4 z-20 w-8 h-8 bg-black/40 border-2 border-white flex items-center justify-center text-white hover:bg-black transition-colors">
                                <X size={16} />
                            </button>
                            <div className="p-6 pb-4 shrink-0 relative z-10 border-b-4 border-black bg-[#1a4d3d]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"><BookOpen size={24} /></div>
                                    <div><h3 className="text-lg font-black text-white uppercase tracking-widest">{t('recipes.stored')}</h3><div className="text-[10px] font-bold tracking-widest text-primary mt-0.5 uppercase">{t('recipes.synced')}</div></div>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto w-full flex-1 relative z-10 space-y-4 bg-background">
                                <div><h4 className="font-black text-xl text-white tracking-widest mb-2 leading-tight flex items-start gap-2 uppercase"><ChefHat size={18} className="text-primary mt-1 shrink-0" />{recipe.name}</h4><div className="text-[11px] text-gray-500 font-bold leading-relaxed uppercase">{recipe.description}</div></div>
                                <div className="bg-black/40 border-4 border-white/10 p-4 shadow-inner"><div className="text-[10px] text-primary mb-3 font-black uppercase tracking-widest flex items-center gap-2"><ChefHat size={12} />{t('recipes.requirements')}</div><div className="flex flex-wrap gap-2">{recipe.requiredIngredients.map((ing: string, idx: number) => (<span key={idx} className="bg-primary/10 border-2 border-primary/40 text-white px-3 py-1.5 text-[10px] font-bold uppercase">{ing}</span>))}</div></div>
                                <div className="bg-black/40 border-4 border-white/10 p-4 shadow-inner"><div className="text-[10px] text-amber-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2"><BookOpen size={12} />{t('recipes.protocols')}</div><div className="space-y-4">{recipe.steps ? recipe.steps.map((s: any, idx: number) => (<div key={idx} className="flex gap-3"><div className="w-6 h-6 bg-amber-400 border-2 border-black text-background flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</div><div><div className="text-white font-black text-[11px] tracking-wider mb-1 mt-0.5 uppercase">{s.title}</div><div className="text-gray-500 text-[10px] leading-relaxed font-bold uppercase">{s.description}</div></div></div>)) : <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{t('common.waiting')}</div>}</div></div>
                            </div>
                            <div className="p-4 shrink-0 relative z-10 bg-[#1a4d3d] border-t-4 border-black">
                                <button onClick={() => { setShowSaveModal(false); nav("/saved"); }} className="w-full bg-primary text-background py-4 border-4 border-black font-black text-[11px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] hover:brightness-110 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all">{t('recipes.view_collection')}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
