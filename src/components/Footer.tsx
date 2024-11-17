import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 mt-auto backdrop-blur-sm transition-all">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 space-y-2 sm:space-y-0">
          <p>Version 0.2.0-alpha</p>
          <p className="flex items-center gap-2">
            Créé avec <Heart className="w-4 h-4 text-red-500" /> par Kévin Cabon
          </p>
        </div>
      </div>
    </footer>
  );
}