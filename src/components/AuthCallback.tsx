import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Gérer la session depuis l'URL hash
        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');

          if (accessToken) {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
              setUser(user);
              toast.success('Connexion réussie');
              navigate('/', { replace: true });
              return;
            }
          }
        }

        // Vérification de session existante
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          navigate('/', { replace: true });
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        toast.error('Erreur lors de la connexion');
        navigate('/');
      }
    };

    // Ajout d'un petit délai pour s'assurer que le hash est disponible
    setTimeout(handleAuthCallback, 100);
  }, [navigate, setUser, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-pulse text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Connexion en cours...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Veuillez patienter pendant que nous finalisons votre connexion
        </p>
      </div>
    </div>
  );
}