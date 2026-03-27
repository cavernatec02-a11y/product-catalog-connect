import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 40;

interface ProductGridProps {
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (key: string) => void;
  onDetails: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  productKey: (p: Product) => string;
}

export function ProductGrid({ products, favorites, onToggleFavorite, onDetails, onEdit, onDelete, productKey }: ProductGridProps) {
  const [page, setPage] = useState(0);

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Nenhum produto encontrado</p>
        <p className="text-sm mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages - 1);
  const paged = products.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paged.map((product, index) => {
          const key = productKey(product);
          return (
            <ProductCard
              key={`${product.table}-${product.code}-${currentPage}-${index}`}
              product={product}
              isFavorite={favorites.has(key)}
              onToggleFavorite={() => onToggleFavorite(key)}
              onDetails={() => onDetails(product)}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
            />
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
