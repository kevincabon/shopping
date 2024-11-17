import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ShoppingList = Database['public']['Tables']['shopping_lists']['Row'];
type ShoppingListItem = Database['public']['Tables']['shopping_list_items']['Row'];
type PriceHistory = Database['public']['Tables']['price_history']['Row'];

export const supabaseService = {
  // Stores
  async getStores() {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des magasins:', error);
      toast.error('Erreur lors de la récupération des magasins');
      return [];
    }
  },

  async createStore(name: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('stores')
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      toast.success('Magasin créé avec succès');
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du magasin:', error);
      toast.error('Erreur lors de la création du magasin');
      return null;
    }
  },

  async updateStore(id: number, name: string) {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      toast.success('Magasin mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du magasin:', error);
      toast.error('Erreur lors de la mise à jour du magasin');
    }
  },

  async deleteStore(id: number) {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Magasin supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du magasin:', error);
      toast.error('Erreur lors de la suppression du magasin');
    }
  },

  // Products
  async getProducts(storeId?: number) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          price_history (*)
        `)
        .order('name');

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      toast.error('Erreur lors de la récupération des produits');
      return [];
    }
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'user_id' | 'in_list' | 'quantity'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          user_id: user.id,
          in_list: false,
          quantity: 0
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await supabase
          .from('price_history')
          .insert({
            product_id: data.id,
            price: product.price,
            user_id: user.id
          });
      }

      toast.success('Produit créé avec succès');
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      toast.error('Erreur lors de la création du produit');
      return null;
    }
  },

  async updateProduct(id: number, updates: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>) {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      //toast.success('Produit mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      toast.error('Erreur lors de la mise à jour du produit');
    }
  },

  async deleteProduct(id: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // D'abord supprimer l'historique des prix
      const { error: priceHistoryError } = await supabase
        .from('price_history')
        .delete()
        .eq('product_id', id);

      if (priceHistoryError) throw priceHistoryError;

      // Ensuite supprimer les éléments de la liste de courses
      const { error: listItemsError } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('product_id', id);

      if (listItemsError) throw listItemsError;

      // Enfin supprimer le produit
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (productError) throw productError;

      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
      throw error;
    }
  },

  async addPriceHistory(productId: number, price: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('price_history')
        .insert({
          product_id: productId,
          price,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'historique des prix:', error);
      toast.error('Erreur lors de l\'ajout de l\'historique des prix');
      throw error;
    }
  },

  // Shopping Lists
  async getShoppingLists(storeId?: number) {
    try {
      let query = supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items!inner (
            *,
            product:products!inner (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShoppingList[];
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error);
      toast.error('Erreur lors de la récupération des listes');
      return [];
    }
  },

  async createShoppingList(list: Omit<ShoppingList, 'id' | 'created_at' | 'user_id'>, items: Omit<ShoppingListItem, 'id' | 'created_at' | 'user_id' | 'shopping_list_id'>[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: shoppingList, error: listError } = await supabase
        .from('shopping_lists')
        .insert({ ...list, user_id: user.id })
        .select()
        .single();

      if (listError) throw listError;

      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .insert(
          items.map(item => ({
            ...item,
            shopping_list_id: shoppingList.id,
            user_id: user.id
          }))
        );

      if (itemsError) throw itemsError;
      toast.success('Liste de courses sauvegardée');
      return shoppingList;
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
      toast.error('Erreur lors de la création de la liste');
      return null;
    }
  },

  async deleteShoppingList(id: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // D'abord récupérer les éléments de la liste pour mettre à jour les compteurs
      const { data: items, error: fetchError } = await supabase
        .from('shopping_list_items')
        .select('product_id, quantity')
        .eq('shopping_list_id', id);

      if (fetchError) throw fetchError;

      // Mettre à jour le compteur d'achats pour chaque produit
      if (items) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('purchase_count')
            .eq('id', item.product_id)
            .single();

          if (product) {
            const newCount = Math.max(0, (product.purchase_count || 0) - item.quantity);
            await supabase
              .from('products')
              .update({ purchase_count: newCount })
              .eq('id', item.product_id);
          }
        }
      }

      // Supprimer les éléments de la liste
      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('shopping_list_id', id)
        .eq('user_id', user.id);

      if (itemsError) throw itemsError;

      // Enfin, supprimer la liste elle-même
      const { error: listError } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (listError) throw listError;

      toast.success('Liste supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      toast.error('Erreur lors de la suppression de la liste');
      throw error;
    }
  },

  async resetDatabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
      await supabase.from('shopping_list_items').delete().eq('user_id', user.id);
      await supabase.from('shopping_lists').delete().eq('user_id', user.id);
      await supabase.from('price_history').delete().eq('user_id', user.id);
      await supabase.from('products').delete().eq('user_id', user.id);
      await supabase.from('stores').delete().eq('user_id', user.id);

      toast.success('Base de données réinitialisée');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation');
      throw error;
    }
  },
}; 