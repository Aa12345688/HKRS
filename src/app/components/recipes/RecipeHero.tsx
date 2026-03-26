import { useIngredients } from "../../services/IngredientContext";

interface RecipeHeroProps {
    image: string;
    name: string;
}

export function RecipeHero({ image, name }: RecipeHeroProps) {
    return (
        <div className="relative h-64 overflow-hidden border-b-4 border-white">
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="px-2.5 py-1 bg-primary text-background text-[8px] font-black border-2 border-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
                        98% COMPATIBLE
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight [text-shadow:2px_2px_0_#000]">
                    {name}
                </h2>
            </div>
        </div>
    );
}
