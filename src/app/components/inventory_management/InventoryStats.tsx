import { Package, AlertTriangle, AlertCircle } from "lucide-react";

interface InventoryStatsProps {
    freshItems: number;
    expiredItems: number;
}

export function InventoryStats({ freshItems, expiredItems }: InventoryStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 px-4 py-2">
            <div className="bg-card border-4 border-primary p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all">
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary" />
                <div className="text-xl font-black text-primary mb-0.5">{freshItems}</div>
                <div className="text-[7px] font-black text-white/40 uppercase tracking-widest">FRESH</div>
            </div>

            <div className={`border-4 p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all ${expiredItems > 0 ? "bg-red-500/10 border-red-500" : "bg-white/5 border-white/10 opacity-60"}`}>
                <div className={`text-xl font-black mb-0.5 ${expiredItems > 0 ? "text-red-500" : "text-white/40"}`}>{expiredItems}</div>
                <div className={`text-[7px] font-black uppercase tracking-widest ${expiredItems > 0 ? "text-red-500" : "text-white/40"}`}>EXPIRED</div>
            </div>
        </div>
    );
}
