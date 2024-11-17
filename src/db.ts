import Dexie, { Table } from 'dexie';

export interface Store {
  id?: number;
  name: string;
}

export interface PriceHistory {
  price: number;
  date: Date;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  storeId: number;
  inList: boolean;
  quantity: number;
  barcode?: string;
  imageUrl?: string;
  createdAt: Date;
  addedToListAt?: Date;
  priceHistory: PriceHistory[];
  purchaseCount: number;
}

export interface SavedListProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface SavedList {
  id?: number;
  storeId: number;
  date: Date;
  weekNumber: number;
  products: SavedListProduct[];
  total: number;
}

export class ShoppingListDB extends Dexie {
  stores!: Table<Store>;
  products!: Table<Product>;
  savedLists!: Table<SavedList>;

  constructor() {
    super('ShoppingListDB');
    this.version(5).stores({
      stores: '++id, name',
      products: '++id, name, storeId, inList, barcode, createdAt, addedToListAt, purchaseCount',
      savedLists: '++id, storeId, date, weekNumber'
    });
  }

  async resetDatabase() {
    await this.transaction('rw', this.stores, this.products, this.savedLists, async () => {
      await Promise.all([
        this.stores.clear(),
        this.products.clear(),
        this.savedLists.clear()
      ]);
    });
  }

  async incrementPurchaseCount(productId: number, quantity: number) {
    const product = await this.products.get(productId);
    if (product) {
      await this.products.update(productId, {
        purchaseCount: (product.purchaseCount || 0) + quantity
      });
    }
  }
}

export const db = new ShoppingListDB();