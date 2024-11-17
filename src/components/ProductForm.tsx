import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, Barcode, Camera } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { fetchProductByBarcode } from '../api/openFoodFacts';
import { toast } from 'react-hot-toast';
import { BarcodeScanner } from './BarcodeScanner';
import { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface ProductFormProps {
  initialStoreId: number | null;
}

export function ProductForm({ initialStoreId }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(initialStoreId);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    setSelectedStoreId(initialStoreId);
  }, [initialStoreId]);

  const loadStores = async () => {
    try {
      const data = await supabaseService.getStores();
      setStores(data);
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      toast.error('Erreur lors du chargement des magasins');
    } finally {
      setIsLoadingStores(false);
    }
  };

  const handleBarcodeSearch = async (code: string = barcode) => {
    if (!code) return;
    
    setIsLoading(true);
    try {
      const productData = await fetchProductByBarcode(code);
      if (productData && productData.product) {
        setName(productData.product.product_name || '');
        setImageUrl(productData.product.image_url || '');
        setBarcode(code);
        toast.success('Informations du produit récupérées');
      } else {
        setBarcode(code);
        toast.error('Produit non trouvé dans la base OpenFoodFacts');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la recherche du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      toast.error('Veuillez sélectionner un magasin');
      return;
    }
    if (!name || !price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const product = await supabaseService.createProduct({
        name,
        price: Number(price),
        store_id: selectedStoreId,
        barcode: barcode || undefined,
        image_url: imageUrl || undefined,
        purchase_count: 0
      });

      if (product) {
        setName('');
        setPrice('');
        setBarcode('');
        setImageUrl('');
        toast.success('Produit ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  const handleBarcodeScan = async (scannedBarcode: string) => {
    await handleBarcodeSearch(scannedBarcode);
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ajouter un produit</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Magasin
          </label>
          {isLoadingStores ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    store.id === selectedStoreId
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {store.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Code-barres
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Code-barres"
            />
            <button
              type="button"
              onClick={() => handleBarcodeSearch()}
              disabled={isLoading || !barcode}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full disabled:opacity-50"
              title="Rechercher le code-barres"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Barcode className="w-5 h-5" />
              )}
            </button>
            {isMobileDevice() && (
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                title="Scanner un code-barres"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Nom du produit
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Prix (€)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Ajouter
        </button>
      </div>

      {isScanning && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScanning(false)}
        />
      )}
    </form>
  );
}