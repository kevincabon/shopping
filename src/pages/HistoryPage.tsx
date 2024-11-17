import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Package2, Trash2, Download, Store as StoreIcon } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { formatDate, formatPrice } from '../utils/utils';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { ProductImage } from '../components/ProductImage';
import { generateShoppingListPDF } from '../utils/pdfGenerator';
import { Database } from '../lib/database.types';
import { PDFProduct } from '../types/pdf';

type Store = Database['public']['Tables']['stores']['Row'];
type ShoppingList = Database['public']['Tables']['shopping_lists']['Row'] & {
  shopping_list_items: Array<{
    product: Database['public']['Tables']['products']['Row'];
  }>;
};

export function HistoryPage() {
  const navigate = useNavigate();
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Historique des Listes - Ma Liste de Courses';
    loadStores();
    loadShoppingLists();
  }, []);

  useEffect(() => {
    loadShoppingLists();
  }, [selectedStoreId]);

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

  const loadShoppingLists = async () => {
    try {
      const data = await supabaseService.getShoppingLists(selectedStoreId);
      setShoppingLists(data as ShoppingList[]);
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error);
      toast.error('Erreur lors du chargement des listes');
    }
  };

  const handleDeleteList = async (id: number) => {
    try {
      await supabaseService.deleteShoppingList(id);
      setShoppingLists(prev => prev.filter(list => list.id !== id));
      toast.success('Liste supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      toast.error('Erreur lors de la suppression de la liste');
    }
  };

  const handleDownloadPDF = (list: ShoppingList) => {
    try {
      const store = stores.find(s => s.id === list.store_id);
      if (!store) return;

      const pdfProducts: PDFProduct[] = list.shopping_list_items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.product.quantity,
        imageUrl: item.product.image_url
      }));

      const pdf = generateShoppingListPDF({
        products: pdfProducts,
        storeName: store.name,
        total: list.total,
        date: new Date(list.created_at)
      });

      pdf.save(`liste-courses-${store.name}-${list.created_at.split('T')[0]}.pdf`);
      toast.success('PDF téléchargé');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Historique des listes
            </h1>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <StoreIcon className="w-5 h-5" />
            Filtrer par magasin
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStoreId(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStoreId === null
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Tous les magasins
            </button>
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStoreId(store.id!)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  store.id === selectedStoreId
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {shoppingLists.length > 0 ? (
            shoppingLists.map((list) => (
              <div 
                key={list.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {stores.find(s => s.id === list.store_id)?.name || 'Magasin inconnu'}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-4 text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(new Date(list.created_at))}
                        </span>
                        <span className="flex items-center">
                          <Package2 className="w-4 h-4 mr-1" />
                          {list.shopping_list_items.length} articles
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice(list.total)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadPDF(list)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Télécharger le PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setListToDelete(list.id!)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer la liste"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {list.shopping_list_items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between py-2 border-t dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10">
                            <ProductImage imageUrl={item.product.image_url} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <Package2 className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune liste sauvegardée
                {selectedStoreId && ' pour ce magasin'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Les listes que vous sauvegardez apparaîtront ici
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={() => handleDeleteList(listToDelete!)}
        title="Supprimer la liste"
        message="Êtes-vous sûr de vouloir supprimer cette liste de courses ?"
      />
    </div>
  );
}