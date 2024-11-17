import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogIn, Database, HardDrive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'react-hot-toast';

export function AuthRequired() {
  const { user, setUser, setOfflineMode, isOfflineMode } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [hasStores, setHasStores] = React.useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isOfflineMode) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Vérifier si l'utilisateur a des magasins
            const stores = await supabaseService.getStores();
            setHasStores(stores.length > 0);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          toast.error('Erreur lors de la vérification de l\'authentification');
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            const stores = await supabaseService.getStores();
            setHasStores(stores.length > 0);
          }
        });

        return () => subscription.unsubscribe();
      }
    };

    checkAuth().finally(() => setLoading(false));
  }, [setUser, isOfflineMode]);

  if (loading) {
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

  if (!user && !isOfflineMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ma Liste de Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Choisissez comment vous souhaitez utiliser l'application
          </p>
          <div className="space-y-4">
            <button
              onClick={() => useAuthStore.getState().signIn()}
              className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow"
            >
              <Database className="w-5 h-5 mr-2" />
              Se connecter avec Google
              <span className="text-xs ml-2 bg-white/20 px-2 py-1 rounded-full">
                Synchronisation cloud
              </span>
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
              </div>
            </div>
            <button
              onClick={() => useAuthStore.getState().setOfflineMode(true)}
              className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-700 hover:to-gray-600 transition-all duration-200 shadow-sm hover:shadow"
            >
              <HardDrive className="w-5 h-5 mr-2" />
              Utiliser sans connexion
              <span className="text-xs ml-2 bg-white/20 px-2 py-1 rounded-full">
                Stockage local
              </span>
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Le mode sans connexion stocke vos données uniquement sur cet appareil
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}