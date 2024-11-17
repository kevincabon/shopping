import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HistoryPage } from './pages/HistoryPage';
import { ProductHistoryPage } from './pages/ProductHistoryPage';
import { AuthRequired } from './components/AuthRequired';
import { AuthCallback } from './components/AuthCallback';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<AuthRequired />}>
          <Route path="/" element={<MainLayout />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/product/:productId/history" element={<ProductHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}