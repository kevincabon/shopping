import React, { useState, useEffect } from 'react';
import { Building2, Store as StoreIcon, ShoppingCart, ShoppingBag } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Database } from '../lib/database.types';
import { toast } from 'react-hot-toast';

type Store = Database['public']['Tables']['stores']['Row'];

// Mapping des icônes par défaut pour certains magasins courants
const getStoreIcon = (storeName: string) => {
  const name = storeName.toLowerCase();
  if (name.includes('carrefour')) return <ShoppingCart className="w-5 h-5" />;
  if (name.includes('leclerc')) return <ShoppingBag className="w-5 h-5" />;
  if (name.includes('super')) return <ShoppingCart className="w-5 h-5" />;
  if (name.includes('marché')) return <ShoppingBag className="w-5 h-5" />;
  return <StoreIcon className="w-5 h-5" />;
};

interface StoreSelectorProps {
  selectedStoreId: number | null;
  onStoreSelect: (storeId: number) => void;
}

export function StoreSelector({ selectedStoreId, onStoreSelect }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await supabaseService.getStores();
      setStores(data);
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      toast.error('Erreur lors du chargement des magasins');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className="text-center p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 backdrop-blur-sm w-full">
        <Building2 className="w-8 h-8 mx-auto text-blue-500 dark:text-blue-400 mb-3" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Veuillez d'abord ajouter un magasin dans la section "Gestion des magasins"
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full sm:w-auto">
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <StoreIcon className="w-5 h-5" />
        Sélectionnez un magasin
      </h2>
      <div className="flex flex-wrap gap-3">
        {stores.map((store) => (
          <button
            key={store.id}
            onClick={() => store.id && onStoreSelect(store.id)}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              store.id === selectedStoreId
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
            }`}
          >
            {getStoreIcon(store.name)}
            {store.name}
          </button>
        ))}
      </div>
    </div>
  );
}