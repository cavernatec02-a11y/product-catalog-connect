import type { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductDetailDialogProps {
  product: Product | null;
  onClose: () => void;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="bg-card border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{product.description}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Código</p>
              <p className="font-mono font-medium text-catalog-code">{product.code}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Unidade</p>
              <p className="font-medium text-foreground">{product.unit}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Categoria</p>
              <p className="font-medium text-foreground">{product.category}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Preço</p>
              <p className="font-bold text-lg text-foreground">{formatPrice(product.price)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
