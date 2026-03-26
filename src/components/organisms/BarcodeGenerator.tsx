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
    <div className="flex flex-col bg-white p-2 rounded-lg border border-gray-200 w-full max-w-[340px] md:mx-auto print:mx-0 print:border-none print:p-0.5 print-container shadow-sm print:shadow-none overflow-hidden text-black">
      {/* Sticker Header */}
      <div className="flex justify-between items-center border-b border-black/80 pb-0.5 mb-1.5 px-0.5">
        <h3 className="font-black text-lg italic leading-none tracking-tighter">HKRS</h3>
        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest print:text-black">Inventory Label</span>
      </div>

      <div className="flex gap-2 mb-1.5 px-0.5">
        {/* SKU Barcode Section */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="mb-1">
             <p className="text-[11px] font-black leading-tight line-clamp-2 uppercase tracking-tight">{productName || 'HKRS PART'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <svg ref={barcodeRef} className="h-[40px] max-w-full"></svg>
          </div>
        </div>

        {/* QR & Price Section */}
        <div className="shrink-0 flex flex-col items-center justify-between border-l border-gray-100 pl-2 print:border-black/10">
          <canvas ref={qrcodeCanvasRef} className="w-14 h-14"></canvas>
          <div className="text-right mt-0.5">
             <p className="text-[12px] font-black leading-none py-0.5 whitespace-nowrap">NT$ {price?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>

      {/* Grid Metadata Footer */}
      <div className="grid grid-cols-4 gap-x-1 gap-y-0.5 w-full pt-1.5 border-t border-black/10 text-black px-0.5">
        <div className="col-span-1">
          <span className="text-[6px] font-bold text-gray-400 block uppercase print:text-black leading-none">SKU</span>
          <span className="text-[9px] font-black font-mono leading-none truncate block">{skuCode}</span>
        </div>
        <div className="col-span-1 border-l border-gray-100 pl-1 print:border-black/10">
          <span className="text-[6px] font-bold text-gray-400 block uppercase print:text-black leading-none">Batch</span>
          <span className="text-[9px] font-black font-mono leading-none truncate block">{batchInfo?.lot || 'REG'}</span>
        </div>
        <div className="col-span-1 border-l border-gray-100 pl-1 print:border-black/10">
          <span className="text-[6px] font-bold text-gray-400 block uppercase print:text-black leading-none">Qty</span>
          <span className="text-[9px] font-black leading-none block">{batchInfo?.qty || 0} PCS</span>
        </div>
        <div className="col-span-1 border-l border-gray-100 pl-1 print:border-black/10 text-right">
          <span className="text-[6px] font-bold text-gray-400 block uppercase print:text-black leading-none">Date</span>
          <span className="text-[9px] font-black leading-none block">{new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}</span>
        </div>
      </div>

      {/* Action (Hidden in print) */}
      <div className="mt-2 flex justify-center no-print border-t border-gray-50 pt-2 pb-1">
        <button 
          onClick={handlePrint}
          className="bg-black text-white px-5 py-1.5 rounded-full font-bold text-[9px] hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
        >
          <Printer size={10} strokeWidth={3} /> 列印標籤
        </button>
      </div>
    </div>
  );
};
