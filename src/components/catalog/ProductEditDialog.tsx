import { useState } from "react";
import type { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ProductEditDialogProps {
  product: Product | null;
  onClose: () => void;
  onSave: (original: Product, updated: { code: string; price: number }) => void;
}

export function ProductEditDialog({ product, onClose, onSave }: ProductEditDialogProps) {
  const [code, setCode] = useState("");
  const [priceStr, setPriceStr] = useState("");

  const handleOpen = (open: boolean) => {
    if (!open) onClose();
  };

  if (!product) return null;

  // Sync state when product changes
  if (product && code === "" && priceStr === "") {
    setCode(product.code);
    setPriceStr(product.price.toFixed(2).replace(".", ","));
  }

  const handleSave = () => {
    const cleanPrice = priceStr.replace(/\./g, "").replace(",", ".");
    const numPrice = parseFloat(cleanPrice);

    if (!code.trim()) return;
    if (isNaN(numPrice) || numPrice < 0) return;

    onSave(product, { code: code.trim(), price: numPrice });
    setCode("");
    setPriceStr("");
    onClose();
  };

  const handleClose = () => {
    setCode("");
    setPriceStr("");
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="bg-card border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="space-y-2">
            <Label htmlFor="edit-code" className="text-foreground">Código</Label>
            <Input
              id="edit-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-muted border-0 font-mono"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-foreground">Valor (R$)</Label>
            <Input
              id="edit-price"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              className="bg-muted border-0 font-mono"
              placeholder="0,00"
              maxLength={20}
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}