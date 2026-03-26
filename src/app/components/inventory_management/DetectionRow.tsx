import { Trash2, Plus, Minus } from "lucide-react";

interface DetectionRowProps {
    item: any;
    onUpdate: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

export function DetectionRow({ item, onUpdate, onRemove }: DetectionRowProps) {
    return (
        <div className="bg-card p-4 border-2 border-white hover:border-primary transition-all group active:translate-x-[1px] active:translate-y-[1px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
                {/* Placeholder for item image if available */}
                <div className="w-12 h-12 bg-background border-2 border-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-primary shadow-[0_0_8px_#00ff88]" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-sm tracking-tight mb-1 uppercase truncate group-hover:text-primary transition-colors leading-tight">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">
                            VERIFIED NODE
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-black border-2 border-white/20 p-0.5">
                        <button
                            onClick={() => onUpdate(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-primary hover:text-black transition-all text-gray-500"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-black text-primary text-sm tabular-nums">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdate(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-primary hover:text-black transition-all text-gray-500"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="w-10 h-10 bg-red-500 text-white border-2 border-black flex items-center justify-center hover:bg-red-600 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
