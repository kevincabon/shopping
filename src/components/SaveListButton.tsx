import React from 'react';
import { Save } from 'lucide-react';
import { db, Product } from '../db';
import { getWeekNumber } from '../utils/dateUtils';
import { handleError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

interface SaveListButtonProps {
  products: Product[];
  storeId: number;
  total: number;
}

export function SaveListButton({ products, storeId, total }: SaveListButtonProps) {
  const handleSave = async () => {
    try {
      const today = new Date();
      const items = products.map(p => ({
        productId: p.id!,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        imageUrl: p.imageUrl
      }));

      await db.savedLists.add({
        storeId,
        date: today,
        weekNumber: getWeekNumber(today),
        total,
        items
      });

      toast.success('Liste de courses sauvegardée');
    } catch (error) {
      handleError(error, 'Sauvegarde de la liste');
      toast.error('Erreur lors de la sauvegarde de la liste');
    }
  };

  return (
    <button
      onClick={handleSave}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <Save className="w-4 h-4 mr-2" />
      Sauvegarder la liste
    </button>
  );
}