import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeGeneratorProps {
  skuCode: string;
  batchInfo?: {
    lot: string;
    qty: number;
    arrivalDate: string;
  };
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ skuCode, batchInfo }) => {
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
    <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200 w-[280px] mx-auto print-container shadow-sm">
      {/* Compact Header */}
      <div className="w-full border-b border-black pb-1 mb-2 flex justify-between items-center">
        <h3 className="text-black font-black text-base italic leading-none">HKRS</h3>
        <p className="text-black text-[8px] font-bold uppercase tracking-tighter">Inventory Label</p>
      </div>

      <div className="w-full flex items-start justify-between gap-2 mb-2">
        {/* SKU Barcode */}
        <div className="flex flex-col items-center flex-1">
          <svg ref={barcodeRef} className="max-w-full h-auto"></svg>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center justify-center pt-1">
          <canvas ref={qrcodeCanvasRef} className="max-w-full h-auto"></canvas>
          <span className="text-[7px] font-black text-gray-400 uppercase mt-0.5 print:text-black">Scan Info</span>
        </div>
      </div>

      {/* Product Metadata Table - Multi-column compact */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 w-full pt-1 border-t border-black/10 text-black">
        <div>
          <span className="text-[7px] font-bold text-gray-400 block uppercase print:text-black">SKU</span>
          <span className="text-[10px] font-black font-mono leading-none">{skuCode}</span>
        </div>
        <div>
          <span className="text-[7px] font-bold text-gray-400 block uppercase print:text-black">Batch</span>
          <span className="text-[10px] font-black font-mono leading-none truncate block">{batchInfo?.lot || 'REG'}</span>
        </div>
        <div>
          <span className="text-[7px] font-bold text-gray-400 block uppercase print:text-black">Qty</span>
          <span className="text-[10px] font-black leading-none">{batchInfo?.qty || 0} PCS</span>
        </div>
        <div>
          <span className="text-[7px] font-bold text-gray-400 block uppercase print:text-black">Date</span>
          <span className="text-[10px] font-black leading-none">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tiny Footer */}
      <div className="mt-2 text-center opacity-40">
         <p className="text-black font-bold text-[6px] tracking-widest uppercase italic">HKRS - Racing Parts Control</p>
      </div>

      {/* Action (Hidden in print) */}
      <div className="mt-3 no-print">
        <button 
          onClick={handlePrint}
          className="bg-black text-white px-4 py-1.5 rounded-md font-bold text-[10px] hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          列印
        </button>
      </div>
    </div>
  );
};
