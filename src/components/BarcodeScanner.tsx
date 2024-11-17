import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/library';
import { toast } from 'react-hot-toast';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Vérifier si l'API MediaDevices est disponible
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('La caméra n\'est pas supportée sur ce navigateur');
        }

        // Créer une nouvelle instance du lecteur
        const codeReader = new BrowserMultiFormatReader();

        // Obtenir la liste des caméras disponibles
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        // Sélectionner la caméra arrière si disponible
        const selectedDeviceId = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('arrière')
        )?.deviceId;

        if (!videoRef.current) return;

        // Démarrer le scanner avec la caméra sélectionnée
        controlsRef.current = await codeReader.decodeFromVideoDevice(
          selectedDeviceId || undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              const barcode = result.getText();
              onScan(barcode);
              onClose();
            }
          }
        );

        setIsInitializing(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du scanner:', error);
        let errorMessage = 'Erreur lors de l\'initialisation du scanner';
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            errorMessage = 'L\'accès à la caméra a été refusé';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'Aucune caméra n\'a été trouvée';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'La caméra n\'est pas accessible';
          } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'Aucune caméra compatible n\'a été trouvée';
          }
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setIsInitializing(false);
      }
    };

    initializeScanner();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onScan, onClose]);

  const handleRetry = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    setError(null);
    setIsInitializing(true);
    
    // Réinitialiser les permissions de la caméra sur iOS
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          window.location.reload();
        })
        .catch(() => {
          setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
          setIsInitializing(false);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium">Scanner un code-barres</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              autoPlay
              muted
            />
          )}
          {isInitializing && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {!error && "Placez le code-barres dans le champ de la caméra"}
        </div>
      </div>
    </div>
  );
}