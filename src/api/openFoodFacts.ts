interface OpenFoodFactsProduct {
  product: {
    product_name: string;
    brands: string;
    image_url: string;
  };
  status: number;
  status_verbose?: string;
}

export async function fetchProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 1) {
      return data;
    }
    
    throw new Error(data.status_verbose || 'Product not found');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenFoodFacts API error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching product data');
  }
}