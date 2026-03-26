import React from 'react';
import { Package, AlertTriangle, ChevronRight, Tags } from 'lucide-react';
import { Badge } from '../atoms/Badge';

export interface PartItem {
  id: string;
  name: string;
  category: string;
  fitment: string[];
  stock: number;
  safeStock: number;
  price: number;
  imageUrl?: string;
  isSelected?: boolean;
}

interface PartCardProps {
  part: PartItem;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  selectable?: boolean;
}

export const PartCard: React.FC<PartCardProps> = ({ part, onClick, onSelect, selectable }) => {
  const isLowStock = part.stock <= part.safeStock;

  return (
    <div 
      onClick={selectable ? undefined : onClick}
      className={`group relative bg-[#0f1115] border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col h-full
        ${selectable && part.isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-800/80 hover:border-gray-600'}
        ${!selectable && onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98]' : ''}
      `}
    >
      {/* Selection Overlay for Bulk Actions */}
      {selectable && (
        <label className="absolute top-3 left-3 z-20 cursor-pointer">
           <input 
             type="checkbox" 
             checked={part.isSelected} 
             onChange={(e) => onSelect?.(e.target.checked)}
             className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
           />
        </label>
      )}

      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        {part.imageUrl ? (
          <img 
            src={part.imageUrl} 
            alt={part.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800 transition-colors group-hover:text-gray-700">
            <Package size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <Badge variant="info" className="bg-black/60 backdrop-blur-md border border-white/10 text-[10px]">
            {part.category}
          </Badge>
        </div>
        
        {/* Hover Action Hint */}
        {!selectable && onClick && (
          <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-white text-xs font-black tracking-widest uppercase">
                查看深度履歷 <ChevronRight size={14} />
             </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-[10px] font-mono font-bold text-blue-500/80 tracking-widest mb-1 group-hover:text-blue-400 transition-colors uppercase">
            {part.id}
          </p>
          <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-blue-50 group-hover:drop-shadow-sm transition-colors">
            {part.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {part.fitment.slice(0, 3).map((f) => (
              <span key={f} className="text-[9px] font-bold px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md border border-gray-700/50">
                {f}
              </span>
            ))}
            {part.fitment.length > 3 && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-800 text-gray-500 rounded-md italic">
                +{part.fitment.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">當前庫存</span>
             <p className="text-xl font-black tabular-nums text-white">
               {part.stock} <span className="text-[10px] text-gray-600">PCS</span>
             </p>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">零售價</span>
             <p className="text-lg font-black text-gray-100 tabular-nums italic">
               <span className="text-[10px] text-gray-500 font-normal mr-0.5">NT$</span>
               {part.price.toLocaleString()}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
