import type { QuoteItem } from "@/types/product";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface QuoteDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: QuoteItem[];
  onRemove: (code: string) => void;
  onUpdateQuantity: (code: string, qty: number) => void;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function QuoteDrawer({ open, onOpenChange, items, onRemove, onUpdateQuantity }: QuoteDrawerProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-l overflow-y-auto scrollbar-thin">
        <SheetHeader>
          <SheetTitle className="text-foreground">Orçamento ({items.length} itens)</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm mt-8 text-center">Nenhum item selecionado</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map(item => (
              <div key={item.code} className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-catalog-code">{item.code}</p>
                    <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => onRemove(item.code)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.code, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.code, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
