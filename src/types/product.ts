export interface Product {
  code: string;
  description: string;
  unit: string;
  price: number;
  category: string;
  table: string;
}

export interface QuoteItem extends Product {
  quantity: number;
}
