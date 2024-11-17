import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { Database } from '../lib/database.types';
import { toast } from 'react-hot-toast';

type Product = Database['public']['Tables']['products']['Row'];

interface ShoppingContextType {
  products: Product[];
  shoppingListProducts: Product[];
  addToList: (product: Product) => Promise<void>;
  removeFromList: (product: Product) => Promise<void>;
  updateQuantity: (product: Product, quantity: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextType | null>(null);

export function ShoppingProvider({ children, storeId }: { children: React.ReactNode, storeId: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingListProducts, setShoppingListProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (storeId) {
      refreshProducts();
    }
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `store_id=eq.${storeId}`
        },
        () => {
          refreshProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  const refreshProducts = async () => {
    try {
      const data = await supabaseService.getProducts(storeId);
      setProducts(data.filter(p => !p.in_list));
      setShoppingListProducts(data.filter(p => p.in_list));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const addToList = async (product: Product) => {
    try {
      await supabaseService.updateProduct(product.id, {
        in_list: true,
        quantity: 1
      });
      
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setShoppingListProducts(prev => [...prev, { ...product, in_list: true, quantity: 1 }]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error);
      toast.error('Erreur lors de l\'ajout à la liste');
    }
  };

  const removeFromList = async (product: Product) => {
    try {
      await supabaseService.updateProduct(product.id, {
        in_list: false,
        quantity: 0
      });
      
      setShoppingListProducts(prev => prev.filter(p => p.id !== product.id));
      setProducts(prev => [...prev, { ...product, in_list: false, quantity: 0 }]);
    } catch (error) {
      console.error('Erreur lors du retrait de la liste:', error);
      toast.error('Erreur lors du retrait de la liste');
    }
  };

  const updateQuantity = async (product: Product, quantity: number) => {
    try {
      await supabaseService.updateProduct(product.id, {
        quantity,
        in_list: quantity > 0
      });

      if (quantity === 0) {
        setShoppingListProducts(prev => prev.filter(p => p.id !== product.id));
        setProducts(prev => [...prev, { ...product, in_list: false, quantity: 0 }]);
      } else {
        setShoppingListProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, quantity } : p))
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      toast.error('Erreur lors de la mise à jour de la quantité');
    }
  };

  return (
    <ShoppingContext.Provider
      value={{
        products,
        shoppingListProducts,
        addToList,
        removeFromList,
        updateQuantity,
        refreshProducts
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export const useShoppingContext = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingContext must be used within a ShoppingProvider');
  }
  return context;
}; 