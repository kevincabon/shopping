-- Supprimer d'abord les anciennes contraintes de clé étrangère
ALTER TABLE public.price_history 
  DROP CONSTRAINT IF EXISTS price_history_product_id_fkey;

ALTER TABLE public.shopping_list_items 
  DROP CONSTRAINT IF EXISTS shopping_list_items_product_id_fkey,
  DROP CONSTRAINT IF EXISTS shopping_list_items_shopping_list_id_fkey;

-- Recréer les contraintes avec ON DELETE CASCADE
ALTER TABLE public.price_history
  ADD CONSTRAINT price_history_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE CASCADE;

ALTER TABLE public.shopping_list_items
  ADD CONSTRAINT shopping_list_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT shopping_list_items_shopping_list_id_fkey 
  FOREIGN KEY (shopping_list_id) 
  REFERENCES public.shopping_lists(id) 
  ON DELETE CASCADE; 