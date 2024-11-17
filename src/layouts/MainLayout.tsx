import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Settings, LogOut, Database, HardDrive } from 'lucide-react';
import { ProductList } from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { StoreManagement } from '../components/StoreManagement';
import { SidePanel } from '../components/SidePanel';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'react-hot-toast';

export function MainLayout() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedStoreIdForAdd, setSelectedStoreIdForAdd] = useState<number | null>(null);
  const [hasStores, setHasStores] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut, user, isOfflineMode, setOfflineMode } = useAuthStore();

  useEffect(() => {
    document.title = 'Ma Liste de Courses - Simplifiez vos courses quotidiennes';
  }, []);

  useEffect(() => {
    const checkStores = async () => {
      if (!isOfflineMode && user) {
        try {
          const stores = await supabaseService.getStores();
          setHasStores(stores.length > 0);
          // N'ouvrir le panneau que si c'est la première visite et qu'il n'y a pas de magasins
          if (!stores.length && isLoading) {
            setIsPanelOpen(true);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des magasins:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkStores();
  }, [user, isOfflineMode, isLoading]);

  const handleAddProduct = (storeId: number | null) => {
    setSelectedStoreIdForAdd(storeId);
    setIsPanelOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleDisableOfflineMode = () => {
    setOfflineMode(false);
    toast.success('Mode hors ligne désactivé');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chargement...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 text-white shadow-lg transition-all">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <ShoppingBasket className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Ma Liste de Courses</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-blue-100">Simplifiez vos courses quotidiennes</p>
                  {isOfflineMode && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      Mode hors ligne
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {isOfflineMode ? (
                <button
                  onClick={handleDisableOfflineMode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                  title="Passer en mode connecté"
                >
                  <Database className="w-6 h-6" />
                </button>
              ) : user && (
                <>
                  {hasStores && (
                    <button
                      onClick={() => setIsPanelOpen(true)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                      title="Ouvrir les paramètres"
                    >
                      <Settings className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <ErrorBoundary>
          <div className="grid grid-cols-1">
            <div className="w-full">
              <ProductList onAddProduct={handleAddProduct} />
            </div>
          </div>
        </ErrorBoundary>
      </main>

      <Footer />

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedStoreIdForAdd(null);
        }}
        forceOpen={!hasStores}
      >
        <div className="space-y-8">
          <StoreManagement />
          {hasStores && (
            <ProductForm initialStoreId={selectedStoreIdForAdd} />
          )}
        </div>
      </SidePanel>
    </div>
  );
}