import type { Product } from "@/types/product";
import { Eye, Pencil, Heart, HeartOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  isAdded: boolean;
  showFavoritesView: boolean;
  onToggleFavorite: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

const unitColorMap: Record<string, string> = {
  GL: "bg-catalog-badge-gl",
  BL: "bg-catalog-badge-bl",
  SC: "bg-catalog-badge-sc",
  GA: "bg-catalog-badge-ga",
  PT: "bg-catalog-badge-pt",
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductCard({ product, isFavorite, isAdded, showFavoritesView, onToggleFavorite, onDetails, onEdit, onDelete }: ProductCardProps) {
  const badgeClass = unitColorMap[product.unit] || "bg-catalog-badge-default";

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors animate-fade-in">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-mono font-medium text-catalog-code">{product.code}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-primary-foreground ${badgeClass}`}>
              {product.unit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
            <p className="text-lg font-bold text-foreground whitespace-nowrap">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-foreground mt-3 leading-snug line-clamp-2">
          {product.description}
        </h3>
        <span className="inline-block mt-2 text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
          {product.category}
        </span>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onDetails}>
          <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
        </Button>
        <Button variant="ghost" size="sm" className="text-xs px-2" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        {showFavoritesView && isFavorite && (
          <Button variant="ghost" size="sm" className="text-xs px-2 text-destructive hover:text-destructive" onClick={onToggleFavorite}>
            <HeartOff className="w-3.5 h-3.5" />
          </Button>
        )}
        {isAdded && onDelete && (
          <Button variant="ghost" size="sm" className="text-xs px-2 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
