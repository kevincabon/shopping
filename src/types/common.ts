import { Database } from '../lib/database.types';

export type Store = Database['public']['Tables']['stores']['Row'];
export type Product = Database['public']['Tables']['products']['Row'] & {
  price_history: Database['public']['Tables']['price_history']['Row'][];
};
export type ShoppingList = Database['public']['Tables']['shopping_lists']['Row'] & {
  shopping_list_items: Array<{
    id: number;
    product: Database['public']['Tables']['products']['Row'];
    price: number;
    quantity: number;
  }>;
}; 