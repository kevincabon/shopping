import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat, NotFoundException } from '@zxing/library';
import { X, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasDetectedCode, setHasDetectedCode] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isSecureContext && !isLocalhost) {
      toast.error('Le scanner de codes-barres nécessite une connexion sécurisée (HTTPS)');
      onClose();
      return;
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.PURE_BARCODE, true);

    codeReader.current = new BrowserMultiFormatReader(hints);

    const startScanning = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('L\'accès à la caméra n\'est pas supporté sur cet appareil');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current && codeReader.current && !hasDetectedCode) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsScanning(true);

          await codeReader.current.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, error) => {
              if (result && !hasDetectedCode) {
                setHasDetectedCode(true);
                setIsScanning(false);
                onScan(result.getText());
                onClose();
              }
              if (error && !(error instanceof NotFoundException)) {
                console.error('Erreur de lecture:', error);
              }
            }
          );
        }
      } catch (error) {
        if ((error as Error).name === 'NotAllowedError' || (error as Error).name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          toast.error('Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur');
        } else {
          toast.error('Erreur lors de l\'accès à la caméra. Veuillez réessayer.');
        }
      }
    };

    if (!hasDetectedCode) {
      startScanning();
    }

    return () => {
      setIsScanning(false);
      if (codeReader.current) {
        codeReader.current.reset();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onScan, onClose, hasDetectedCode]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Scanner un code-barres
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!window.isSecureContext && !window.location.hostname.includes('localhost') ? (
          <div className="p-8 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Le scanner de codes-barres nécessite une connexion sécurisée (HTTPS).
              Veuillez accéder à l'application via HTTPS pour utiliser cette fonctionnalité.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : permissionDenied ? (
          <div className="p-8 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              L'accès à la caméra a été refusé. Pour utiliser le scanner de codes-barres, 
              veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none"></div>
              {isScanning && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scan en cours...
                </div>
              )}
            </div>
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Placez le code-barres dans le cadre de la caméra
            </div>
          </>
        )}
      </div>
    </div>
  );
}