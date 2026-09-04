import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner when the component mounts
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        // EAN_13, EAN_8, UPC_A, UPC_E, etc
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39
        ]
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // on success
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScanSuccess(decodedText);
      },
      (error) => {
        // on error (happens continuously as it tries to scan)
      }
    );

    // Cleanup function when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181818] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="font-playfair font-bold text-white italic">Scan GS1 Barcode</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 bg-black flex-1 relative">
          <div id="reader" className="w-full h-full min-h-[300px] bg-black rounded-xl overflow-hidden [&>video]:object-cover" />
        </div>
        
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 font-mono">
            Align the barcode within the frame. It will scan automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
