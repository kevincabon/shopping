import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface QuantityControlProps {
  product: Product;
  onQuantityChange?: (newQuantity: number) => void;
}

export function QuantityControl({ product, onQuantityChange }: QuantityControlProps) {
  const updateQuantity = async (newQuantity: number) => {
    if (!product.id) return;

    try {
      await supabaseService.updateProduct(product.id, { 
        quantity: newQuantity,
        in_list: newQuantity > 0
      });

      if (onQuantityChange) {
        onQuantityChange(newQuantity);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => updateQuantity(Math.max(0, product.quantity - 1))}
        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
        {product.quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(product.quantity + 1)}
        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}