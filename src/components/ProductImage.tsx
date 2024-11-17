import React from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  imageUrl?: string | null;
}

export function ProductImage({ imageUrl }: ProductImageProps) {
  if (!imageUrl) return <ImageOff className="w-12 h-12 text-gray-300" />;
  
  return (
    <img
      src={imageUrl}
      alt="Product"
      className="w-12 h-12 object-cover rounded-md"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUtaW1hZ2Utb2ZmIj48bGluZSB4MT0iMiIgeTE9IjIiIHgyPSIyMiIgeTI9IjIyIi8+PHBhdGggZD0iTTEwLjQxIDEwLjI3YTIgMiAwIDEgMSAyLjgzIDIuODMiLz48cGF0aCBkPSJNMjEgMTVWNmEyIDIgMCAwIDAtMi0ySDkuMjgiLz48cGF0aCBkPSJNMjEgMTkuMjhWMTUiLz48cGF0aCBkPSJNMyA4LjdWMjFhMiAyIDAgMCAwIDIgMmgxNC4yOCIvPjxwYXRoIGQ9Ik0xNC45NiA5LjI4QTMgMyAwIDEgMSAxNyAxMiIvPjwvc3ZnPg==';
      }}
    />
  );
}