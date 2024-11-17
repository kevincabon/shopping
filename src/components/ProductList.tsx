import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { StoreSelector } from './StoreSelector';
import { ShoppingList } from './ShoppingList';
import { AllProductsList } from './AllProductsList';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'react-hot-toast';
import { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface ProductListProps {
  onAddProduct: (storeId: number | null) => void;
}

export function ProductList({ onAddProduct }: ProductListProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadProducts();
    }
  }, [selectedStoreId]);

  const loadStores = async () => {
    try {
      const data = await supabaseService.getStores();
      setStores(data);
      if (data.length === 1) {
        setSelectedStoreId(data[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      toast.error('Erreur lors du chargement des magasins');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!selectedStoreId) return;
    try {
      const data = await supabaseService.getProducts(selectedStoreId);
      setAllProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const handleAddToList = async (product: Product) => {
    // Mise à jour optimiste
    setAllProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, in_list: true, quantity: 1 } : p
    ));

    try {
      await supabaseService.updateProduct(product.id, {
        in_list: true,
        quantity: 1
      });
    } catch (error) {
      // En cas d'erreur, on revient en arrière
      setAllProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, in_list: false, quantity: 0 } : p
      ));
      console.error('Erreur lors de l\'ajout à la liste:', error);
      toast.error('Erreur lors de l\'ajout à la liste');
    }
  };

  const handleRemoveFromList = async (product: Product) => {
    // Mise à jour optimiste
    setAllProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, in_list: false, quantity: 0 } : p
    ));

    try {
      await supabaseService.updateProduct(product.id, {
        in_list: false,
        quantity: 0
      });
    } catch (error) {
      // En cas d'erreur, on revient en arrière
      setAllProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, in_list: true, quantity: product.quantity } : p
      ));
      console.error('Erreur lors du retrait de la liste:', error);
      toast.error('Erreur lors du retrait de la liste');
    }
  };

  const handleUpdateQuantity = async (product: Product, quantity: number) => {
    // Mise à jour optimiste
    setAllProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, quantity, in_list: quantity > 0 } : p
    ));

    try {
      await supabaseService.updateProduct(product.id, {
        quantity,
        in_list: quantity > 0
      });
    } catch (error) {
      // En cas d'erreur, on revient en arrière
      setAllProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, quantity: product.quantity } : p
      ));
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      toast.error('Erreur lors de la mise à jour de la quantité');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const shoppingListProducts = allProducts.filter(p => p.in_list);
  const availableProducts = allProducts.filter(p => !p.in_list);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <StoreSelector
          selectedStoreId={selectedStoreId}
          onStoreSelect={setSelectedStoreId}
        />
        {stores.length > 0 && (
          <Link
            to="/history"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Voir l'historique
          </Link>
        )}
      </div>

      <ErrorBoundary>
        {!selectedStoreId ? (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-lg text-center border border-indigo-100 dark:border-indigo-800">
            <Building2 className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400 mb-4" />
            <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              Sélectionnez un magasin
            </h3>
            <p className="text-indigo-600 dark:text-indigo-300">
              Pour créer votre liste de courses, veuillez d'abord sélectionner un magasin parmi ceux disponibles ci-dessus.
            </p>
          </div>
        ) : (
          <>
            <ShoppingList 
              selectedStoreId={selectedStoreId}
              products={shoppingListProducts}
              onRemoveFromList={handleRemoveFromList}
              onUpdateQuantity={handleUpdateQuantity}
            />
            <AllProductsList
              selectedStoreId={selectedStoreId}
              onAddProduct={() => onAddProduct(selectedStoreId)}
              products={availableProducts}
              onAddToList={handleAddToList}
            />
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}