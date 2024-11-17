import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShoppingCart, Store as StoreIcon, Edit2, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { supabaseService } from '../services/supabaseService';
import { formatDate, formatPrice } from '../utils/utils';
import { ProductImage } from '../components/ProductImage';
import { Product, Store } from '../types/common';
import { Database } from '../lib/database.types';
import { toast } from 'react-hot-toast';
import { EditProductForm } from '../components/EditProductForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function ProductHistoryPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    if (!productId) return;

    try {
      const products = await supabaseService.getProducts();
      const foundProduct = products.find(p => p.id === parseInt(productId));
      
      if (foundProduct) {
        setProduct(foundProduct);
        const stores = await supabaseService.getStores();
        const foundStore = stores.find(s => s.id === foundProduct.store_id);
        setStore(foundStore || null);
      } else {
        toast.error('Produit non trouvé');
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      document.title = `Historique des prix - ${product.name} - Ma Liste de Courses`;
    }
  }, [product]);

  const handleDelete = async () => {
    try {
      if (!product?.id) return;
      await supabaseService.deleteProduct(product.id);
      toast.success('Produit supprimé avec succès');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!product || !store) return null;

  const allPriceHistory = [...product.price_history].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const currentPrice = product.price;
  const lastRecordedPrice = allPriceHistory[allPriceHistory.length - 1]?.price;
  const isCurrentPriceDifferent = currentPrice !== lastRecordedPrice;

  const chartData = {
    labels: allPriceHistory.map(entry => formatDate(new Date(entry.created_at))),
    datasets: [
      {
        label: 'Prix',
        data: allPriceHistory.map(entry => entry.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Évolution du prix',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
        titleColor: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        bodyColor: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: number) => formatPrice(value),
          color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#4B5563'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#4B5563'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
        }
      }
    }
  };

  const priceChange = allPriceHistory.length > 1
    ? ((allPriceHistory[allPriceHistory.length - 1].price - allPriceHistory[0].price) / allPriceHistory[0].price) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Modifier le produit"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer le produit"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <ProductImage imageUrl={product.image_url} />
            </div>
            <div className="flex-grow space-y-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <StoreIcon className="w-5 h-5" />
                  {store.name}
                </p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Prix actuel : {formatPrice(product.price)}
                </p>
                <p>Ajouté le : {formatDate(new Date(product.created_at))}</p>
                <p className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <ShoppingCart className="w-5 h-5" />
                  Acheté {product.purchase_count || 0} fois
                </p>
                {product.barcode && <p>Code-barres : {product.barcode}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Historique des prix
            </h2>
            {allPriceHistory.length > 1 && (
              <div className={`text-sm font-medium ${
                priceChange > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}% depuis l'ajout
              </div>
            )}
          </div>

          <div className="h-[400px] mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Détail des changements de prix
            </h3>
            <div className="space-y-2">
              {allPriceHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatDate(new Date(entry.created_at))}
                    </span>
                    {index === allPriceHistory.length - 1 && !isCurrentPriceDifferent && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                        Prix actuel
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(entry.price)}
                    </span>
                  </div>
                </div>
              ))}
              {isCurrentPriceDifferent && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatDate(new Date())}
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                      Prix actuel
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className={`text-sm ${
                      currentPrice > lastRecordedPrice
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {currentPrice > lastRecordedPrice && '+'}
                      {((currentPrice - lastRecordedPrice) / lastRecordedPrice * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing && product && (
          <EditProductForm
            product={product}
            onCancel={() => setIsEditing(false)}
            onSave={() => {
              setIsEditing(false);
              loadData(); // Recharger les données après la modification
            }}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer le produit"
          message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        />
      </div>
    </div>
  );
}