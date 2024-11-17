import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Plus, Trash2, History, Barcode } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { EditProductForm } from './EditProductForm';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'react-hot-toast';
import { ProductImage } from './ProductImage';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface AllProductsListProps {
  selectedStoreId: number | null;
  onAddProduct: () => void;
  products: Product[];
  onAddToList: (product: Product) => void;
}

export function AllProductsList({ selectedStoreId, onAddProduct, products, onAddToList }: AllProductsListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete?.id) return;
    
    try {
      // Mise à jour optimiste
      setLocalProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      await supabaseService.deleteProduct(productToDelete.id);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setLocalProducts(products);
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const toggleInList = async (product: Product) => {
    if (!product.id) return;
    
    try {
      // Mise à jour optimiste
      setLocalProducts(prev => prev.filter(p => p.id !== product.id));
      onAddToList(product);
      toast.success('Produit ajouté à la liste');
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setLocalProducts(products);
      console.error('Erreur lors de l\'ajout à la liste:', error);
      toast.error('Erreur lors de l\'ajout à la liste');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!selectedStoreId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Produits disponibles
        </h2>
        <button
          onClick={onAddProduct}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      {localProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">Aucun produit disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localProducts.map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <ProductImage imageUrl={product.image_url} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price)}
                  </p>
                  {product.barcode && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <Barcode className="w-3 h-3 mr-1" />
                      {product.barcode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/product/${product.id}/history`}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Voir l'historique des prix"
                >
                  <History className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleInList(product)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter à la liste
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ?"
      />
    </div>
  );
}