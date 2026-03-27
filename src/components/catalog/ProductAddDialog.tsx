import { useState } from "react";
import type { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface ProductAddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
  activeTable: string;
  categories: string[];
}

export function ProductAddDialog({ open, onClose, onAdd, activeTable, categories }: ProductAddDialogProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("BL");
  const [priceStr, setPriceStr] = useState("");
  const [category, setCategory] = useState("");

  const filteredCategories = categories.filter((c) => c !== "Todas as Categorias");

  const handleAdd = () => {
    const cleanPrice = priceStr.replace(/\./g, "").replace(",", ".");
    const numPrice = parseFloat(cleanPrice);

    if (!code.trim() || !description.trim() || isNaN(numPrice) || numPrice < 0 || !category) return;

    onAdd({
      code: code.trim(),
      description: description.trim(),
      unit,
      price: numPrice,
      category,
      table: activeTable,
    });

    setCode("");
    setDescription("");
    setUnit("BL");
    setPriceStr("");
    setCategory("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-card border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-foreground">Código</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="bg-muted border-0 font-mono" placeholder="Ex: 5379.S00014.4" />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-muted border-0" placeholder="Ex: TINTA ACRÍLICA - BL 18,0 LTS" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="bg-muted border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["BL", "GL", "SC", "GA", "PT", "LL", "UN"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Valor (R$)</Label>
              <Input value={priceStr} onChange={(e) => setPriceStr(e.target.value)} className="bg-muted border-0 font-mono" placeholder="0,00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
