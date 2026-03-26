import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';

interface BarcodeGeneratorProps {
  skuCode: string;
  productName?: string;
  price?: number;
  batchInfo?: {
    lot: string;
    qty: number;
    arrivalDate: string;
  };
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ skuCode, productName, price, batchInfo }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  const qrData = JSON.stringify({
    s: skuCode,
    l: batchInfo?.lot || 'N/A',
    q: batchInfo?.qty || 0,
    d: batchInfo?.arrivalDate || new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, skuCode, {
        format: "CODE128",
        lineColor: "#000",
        width: 1.5,
        height: 35,
        displayValue: true,
        fontSize: 10,
        margin: 5,
        background: "#fff"
      });
    }

    if (qrcodeCanvasRef.current) {
      QRCode.toCanvas(qrcodeCanvasRef.current, qrData, {
        width: 70,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  }, [skuCode, qrData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col bg-white p-3 rounded-none border border-gray-200 w-full max-w-[380px] md:mx-auto print:mx-0 print:border-black/30 print:p-2 print-container shadow-sm print:shadow-none overflow-hidden text-black font-sans">
      {/* Sticker Header - Image 1 Style */}
      <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-3">
        <h3 className="font-black text-2xl italic leading-none tracking-tighter">HKRS</h3>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest print:text-black mb-0.5">Inventory Label</span>
      </div>

      <div className="flex gap-4 mb-3 border-b border-black/10 pb-3">
        {/* Left: Name & Barcode */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="mb-2">
             <p className="text-[12px] font-bold leading-tight text-gray-900 uppercase tracking-tight truncate">{productName || 'HKRS PART'}</p>
          </div>
          <div className="flex flex-col items-center">
            <svg ref={barcodeRef} className="h-[45px] w-full"></svg>
          </div>
        </div>

        {/* Right: QR Code Only */}
        <div className="shrink-0 flex items-center justify-center border-l border-black/10 pl-6 print:border-black/20">
          <canvas ref={qrcodeCanvasRef} className="w-16 h-16"></canvas>
        </div>
      </div>

      {/* Grid Metadata Footer - 4 Columns with vertical dividers like Image 1 */}
      <div className="grid grid-cols-4 w-full text-black">
        <div className="flex flex-col border-r border-black/10 pr-1">
          <span className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-1">SKU</span>
          <span className="text-[9px] font-black font-mono leading-none truncate">{skuCode}</span>
        </div>
        <div className="flex flex-col border-r border-black/10 px-2">
          <span className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-1">Batch</span>
          <span className="text-[9px] font-black font-mono leading-none truncate">{batchInfo?.lot || 'BATCH-202403-A'}</span>
        </div>
        <div className="flex flex-col border-r border-black/10 px-2">
          <span className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-1">Qty</span>
          <span className="text-[9px] font-black leading-none truncate">{batchInfo?.qty || 20} PCS</span>
        </div>
        <div className="flex flex-col pl-2 text-right">
          <span className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-1">Date</span>
          <span className="text-[9px] font-black leading-none truncate">{new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}</span>
        </div>
      </div>

      {/* Action (Hidden in print) - Using print:hidden as double safety */}
      <div className="mt-4 flex justify-center no-print print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-black text-white px-8 py-2.5 rounded-full font-black text-[11px] transition-all flex items-center gap-2 shadow-xl active:scale-95 border-2 border-emerald-500/50 hover:bg-emerald-600 hover:border-emerald-400 group"
        >
          <Printer size={14} strokeWidth={3} className="text-emerald-400 group-hover:text-white" /> 列印標籤
        </button>
      </div>
    </div>
  );
};
