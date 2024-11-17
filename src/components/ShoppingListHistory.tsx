import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { formatDate } from '../utils/utils';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from './ConfirmDialog';
import { Store, ShoppingList } from '../types/common';

export function ShoppingListHistory() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadShoppingLists();
    }
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
      if (!selectedStoreId) return;
      const data = await supabaseService.getShoppingLists(selectedStoreId);
      setShoppingLists(data as ShoppingList[]);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const handleDeleteList = async (id: number) => {
    setListToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;

    try {
      await supabaseService.deleteShoppingList(listToDelete);
      setShoppingLists(prev => prev.filter(list => list.id !== listToDelete));
      setShowDeleteConfirm(false);
      setListToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      toast.error('Erreur lors de la suppression de la liste');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">Aucun magasin disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Historique des listes de courses</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un magasin
          </label>
          <div className="flex flex-wrap gap-2">
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => setSelectedStoreId(store.id!)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedStoreId === store.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>

        {selectedStoreId ? (
          shoppingLists && shoppingLists.length > 0 ? (
            <div className="space-y-4">
              {shoppingLists.map(list => (
                <div key={list.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(list.created_at))} (Semaine {list.week_number})
                      </p>
                      <p className="font-semibold text-lg">
                        Total: {formatPrice(list.total)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteList(list.id!)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {list.shopping_list_items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>{item.product.name}</span>
                        <span className="text-gray-600">
                          {formatPrice(item.product.price)} × {item.product.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Aucune liste sauvegardée pour ce magasin</p>
          )
        ) : (
          <p className="text-gray-500 text-center">Sélectionnez un magasin pour voir son historique</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer la liste"
        message="Êtes-vous sûr de vouloir supprimer cette liste de courses ?"
      />
    </div>
  );
}