interface Step {
    title: string;
    description: string;
}

import { useIngredients } from "../../services/IngredientContext";

interface CookingProtocolProps {
    steps: Step[];
}

export function CookingProtocol({ steps }: CookingProtocolProps) {
    const { t } = useIngredients();
    return (
        <div className="mb-6 px-2">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary" />
                {t('recipes.cooking_protocol')}
            </h3>
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="relative pl-10">
                        <div className="absolute left-0 top-0 w-6 h-6 bg-black border-2 border-primary flex items-center justify-center text-primary text-[8px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                            {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-0 border-r-2 border-dashed border-primary/20" />
                        )}
                        <h4 className="font-black text-[10px] text-white uppercase tracking-widest mb-1">{step.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
