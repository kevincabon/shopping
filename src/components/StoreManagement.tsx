import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { ConfirmationModal } from './ConfirmationModal';
import { ResetDatabaseModal } from './ResetDatabaseModal';
import { handleError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];

interface EditingStore {
  id: number;
  name: string;
}

export function StoreManagement() {
  const [newStoreName, setNewStoreName] = useState('');
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<EditingStore | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getStores();
      setStores(data);
    } catch (error) {
      handleError(error, 'Chargement des magasins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    try {
      const store = await supabaseService.createStore(newStoreName.trim());
      if (store) {
        setStores(prev => [...prev, store]);
        setNewStoreName('');
      }
    } catch (error) {
      handleError(error, 'Ajout d\'un magasin');
    }
  };

  const handleDelete = async (storeId: number) => {
    try {
      await supabaseService.deleteStore(storeId);
      setStores(prev => prev.filter(store => store.id !== storeId));
      setStoreToDelete(null);
    } catch (error) {
      handleError(error, 'Suppression d\'un magasin');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !editingStore.name.trim()) return;

    try {
      await supabaseService.updateStore(editingStore.id, editingStore.name.trim());
      setStores(prev => prev.map(store => 
        store.id === editingStore.id 
          ? { ...store, name: editingStore.name.trim() }
          : store
      ));
      setEditingStore(null);
    } catch (error) {
      handleError(error, 'Modification d\'un magasin');
    }
  };

  const handleReset = async () => {
    try {
      await supabaseService.resetDatabase();
      await loadStores();
      setIsResetModalOpen(false);
    } catch (error) {
      handleError(error, 'Réinitialisation de la base de données');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gestion des magasins
        </h2>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Réinitialiser la base de données"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="Nom du magasin"
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {stores.map((store) => (
          <div
            key={store.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            {editingStore?.id === store.id ? (
              <form onSubmit={handleEdit} className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <>
                <span className="font-medium text-gray-900 dark:text-white">{store.name}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingStore({ id: store.id, name: store.name })}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setStoreToDelete(store.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!storeToDelete}
        onClose={() => setStoreToDelete(null)}
        onConfirm={() => storeToDelete && handleDelete(storeToDelete)}
        title="Supprimer le magasin"
        message="Êtes-vous sûr de vouloir supprimer ce magasin ? Tous les produits associés seront également supprimés."
      />

      <ResetDatabaseModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}