import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (key: string) => void;
  onDetails: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  productKey: (p: Product) => string;
}

export function ProductGrid({ products, onDetails, onEdit, onDelete }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Nenhum produto encontrado</p>
        <p className="text-sm mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={`${product.table}-${product.code}-${index}`}
          product={product}
          onDetails={() => onDetails(product)}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
        />
      ))}
    </div>
  );
}
