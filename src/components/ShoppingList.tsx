import React, { useState, useEffect } from 'react';
import { ImageOff, Trash2, Barcode, Save, XCircle, GripVertical } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { QuantityControl } from './QuantityControl';
import { toast } from 'react-hot-toast';
import { getWeekNumber } from '../utils/dateUtils';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { generateShoppingListPDF } from '../utils/pdfGenerator';
import { Database } from '../lib/database.types';
import { PDFProduct } from '../types/pdf';

type Product = Database['public']['Tables']['products']['Row'];

interface ShoppingListProps {
  selectedStoreId: number;
  products: Product[];
  onRemoveFromList: (product: Product) => void;
  onUpdateQuantity: (product: Product, quantity: number) => void;
}

interface SortableItemProps {
  product: Product;
  onRemove: (product: Product) => void;
  onQuantityChange: (product: Product, quantity: number) => void;
}

function SortableItem({ product, onRemove, onQuantityChange }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row items-start sm:items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg gap-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="self-start sm:self-center cursor-grab active:cursor-grabbing p-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full"
      >
        <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </div>
      
      <div className="flex flex-1 items-start gap-2 w-full sm:w-auto">
        <div className="flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 sm:w-10 sm:h-10 object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUtaW1hZ2Utb2ZmIj48bGluZSB4MT0iMiIgeTE9IjIiIHgyPSIyMiIgeTI9IjIyIi8+PHBhdGggZD0iTTEwLjQxIDEwLjI3YTIgMiAwIDEgMSAyLjgzIDIuODMiLz48cGF0aCBkPSJNMjEgMTVWNmEyIDIgMCAwIDAtMi0ySDkuMjgiLz48cGF0aCBkPSJNMjEgMTkuMjhWMTUiLz48cGF0aCBkPSJNMyA4LjdWMjFhMiAyIDAgMCAwIDIgMmgxNC4yOCIvPjxwYXRoIGQ9Ik0xNC45NiA5LjI4QTMgMyAwIDEgMSAxNyAxMiIvPjwvc3ZnPg==';
              }}
            />
          ) : (
            <ImageOff className="w-12 h-12 sm:w-10 sm:h-10 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{product.name}</h3>
            <div className="flex items-center gap-2">
              <QuantityControl 
                product={product} 
                onQuantityChange={(quantity) => onQuantityChange(product, quantity)}
              />
              <button
                onClick={() => onRemove(product)}
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Retirer de la liste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              {product.barcode && (
                <>
                  <Barcode className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{product.barcode}</span>
                </>
              )}
            </p>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              {formatPrice(product.price)} × {product.quantity} = {formatPrice(product.price * product.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShoppingList({ selectedStoreId, products, onRemoveFromList, onUpdateQuantity }: ShoppingListProps) {
  const handleDragEnd = async (event: DragEndEvent) => {
    // Gérer le réordonnancement si nécessaire
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleSaveList = async () => {
    try {
      const total = calculateTotal();
      const today = new Date();
      
      const shoppingList = await supabaseService.createShoppingList(
        {
          store_id: selectedStoreId,
          total,
          week_number: getWeekNumber(today)
        },
        products.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          price: p.price
        }))
      );

      if (shoppingList) {
        // Mettre à jour le compteur d'achats pour chaque produit
        await Promise.all(products.map(product => 
          supabaseService.updateProduct(product.id, {
            purchase_count: (product.purchase_count || 0) + product.quantity,
            in_list: false,
            quantity: 0
          })
        ));

        // Générer et télécharger le PDF
        const store = await supabaseService.getStores().then(stores => 
          stores.find(s => s.id === selectedStoreId)
        );

        if (store) {
          const pdfProducts: PDFProduct[] = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            imageUrl: p.image_url
          }));

          const pdf = generateShoppingListPDF({
            products: pdfProducts,
            storeName: store.name,
            total,
            date: today
          });
          pdf.save(`liste-courses-${store.name}-${today.toISOString().split('T')[0]}.pdf`);
        }

        // Vider la liste
        products.forEach(onRemoveFromList);
        toast.success('Liste sauvegardée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la liste:', error);
      toast.error('Erreur lors de la sauvegarde de la liste');
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Liste de courses</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">Votre liste de courses est vide</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Liste de courses</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => products.forEach(onRemoveFromList)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Vider la liste
          </button>
          <button
            onClick={handleSaveList}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products.map(p => p.id!)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {products.map(product => (
              <SortableItem
                key={product.id}
                product={product}
                onRemove={onRemoveFromList}
                onQuantityChange={onUpdateQuantity}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-lg font-semibold text-right text-gray-900 dark:text-white">
          Total: {formatPrice(calculateTotal())}
        </p>
      </div>
    </div>
  );
}