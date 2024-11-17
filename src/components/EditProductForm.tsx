import React, { useState } from 'react';
import { Save, X, Barcode, Loader2, Camera } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { fetchProductByBarcode } from '../api/openFoodFacts';
import { toast } from 'react-hot-toast';
import { BarcodeScanner } from './BarcodeScanner';
import { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface EditProductFormProps {
  product: Product;
  onCancel: () => void;
  onSave: () => void;
}

export function EditProductForm({ product, onCancel, onSave }: EditProductFormProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [barcode, setBarcode] = useState(product.barcode || '');
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleBarcodeSearch = async (code: string = barcode) => {
    if (!code) return;
    
    setIsLoading(true);
    try {
      const productData = await fetchProductByBarcode(code);
      if (productData && productData.product) {
        setName(productData.product.product_name || name);
        setImageUrl(productData.product.image_url || imageUrl);
        setBarcode(code); // S'assurer que le code-barres est mis à jour
        toast.success('Informations du produit récupérées');
      } else {
        setBarcode(code); // Mettre à jour le code-barres même si le produit n'est pas trouvé
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
    if (!name || !price || !product.id) return;

    const newPrice = Number(price);
    const priceChanged = newPrice !== product.price;

    try {
      await supabaseService.updateProduct(product.id, {
        name,
        price: newPrice,
        barcode: barcode || undefined,
        image_url: imageUrl || undefined
      });

      if (priceChanged) {
        await supabaseService.addPriceHistory(product.id, newPrice);
      }

      toast.success('Produit mis à jour avec succès');
      onSave();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      toast.error('Erreur lors de la mise à jour du produit');
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
      <div className="space-y-4">
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

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Enregistrer
          </button>
        </div>
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