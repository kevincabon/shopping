import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetDatabaseModal({
  isOpen,
  onClose,
  onConfirm,
}: ResetDatabaseModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === 'Confirmer') {
      onConfirm();
      setConfirmText('');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold">Réinitialiser la base de données</h3>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Cette action supprimera définitivement toutes les données (magasins, produits, listes). 
              Cette action est irréversible.
            </p>
            <p className="text-gray-600 font-medium">
              Pour confirmer, écrivez "Confirmer" dans le champ ci-dessous :
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(false);
              }}
              className={`w-full p-2 border rounded-md mb-4 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Écrivez 'Confirmer'"
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">
                Veuillez écrire exactement "Confirmer" pour continuer
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}