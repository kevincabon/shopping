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
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Vérifier si nous sommes en HTTPS ou localhost
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
    hints.set(DecodeHintType.ASSUME_GS1, true);

    codeReader.current = new BrowserMultiFormatReader(hints);
    console.log('Scanner initialisé');

    // Liste des caméras disponibles
    const listVideoDevices = async () => {
      try {
        const devices = await codeReader.current?.listVideoInputDevices();
        if (devices && devices.length > 0) {
          console.log('Caméras disponibles:', devices);
          setVideoDevices(devices);
          // Sur mobile, on essaie de sélectionner la caméra arrière par défaut
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('arrière') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedDeviceId(backCamera?.deviceId || devices[0].deviceId);
        }
      } catch (err) {
        console.error('Erreur lors de la liste des caméras:', err);
      }
    };

    listVideoDevices();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId || hasDetectedCode) return;

    const startScanning = async () => {
      try {
        if (!codeReader.current) return;

        setIsScanning(true);
        console.log('Démarrage du scan avec la caméra:', selectedDeviceId);

        await codeReader.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result && !hasDetectedCode) {
              const barcode = result.getText();
              console.log('Code-barres détecté:', barcode);
              setHasDetectedCode(true);
              setIsScanning(false);
              toast.success('Code-barres détecté');
              onScan(barcode);
              onClose();
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Erreur de lecture:', error);
            }
          }
        );
      } catch (error) {
        console.error('Erreur lors de l\'accès à la caméra:', error);
        if ((error as Error).name === 'NotAllowedError' || (error as Error).name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          toast.error('Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur');
        } else {
          toast.error('Erreur lors de l\'accès à la caméra. Veuillez réessayer.');
        }
      }
    };

    startScanning();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [selectedDeviceId, hasDetectedCode, onScan, onClose]);

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
    setHasDetectedCode(false);
    if (codeReader.current) {
      codeReader.current.reset();
    }
  };

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
            {videoDevices.length > 1 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Caméra ${device.deviceId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
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