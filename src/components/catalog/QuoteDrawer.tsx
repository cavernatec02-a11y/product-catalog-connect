import { useState } from "react";
import type { QuoteItem } from "@/types/product";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Download, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuoteDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: QuoteItem[];
  onRemove: (itemKey: string) => void;
  onUpdateQuantity: (itemKey: string, qty: number) => void;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const getItemKey = (item: Pick<QuoteItem, "code" | "table">) => `${item.table ?? "R11"}|${item.code}`;

export function QuoteDrawer({ open, onOpenChange, items, onRemove, onUpdateQuantity }: QuoteDrawerProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

    // Logo/Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red
    doc.text("IBRATIN", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Orçamento de Produtos", 105, 30, { align: "center" });

    // Client Info
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${dateStr}`, 15, 45);
    doc.text(`Cliente: ${clientName || "N/A"}`, 15, 52);
    doc.text(`Endereço: ${clientAddress || "N/A"}`, 15, 59);

    // Table
    autoTable(doc, {
      startY: 70,
      head: [["Código", "Descrição", "Unid", "Qtd", "Preço Unit", "Subtotal"]],
      body: items.map(item => [
        item.code,
        item.description,
        item.unit,
        item.quantity,
        formatPrice(item.price),
        formatPrice(item.price * item.quantity)
      ]),
      foot: [[{ content: "Total", colSpan: 5, styles: { halign: "right" } }, formatPrice(total)]],
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`orcamento_${clientName.replace(/\s+/g, "_") || "ibratin"}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const dateStr = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    let message = `*Olá, segue meu orçamento Ibratin (${dateStr})*\n\n`;
    message += `*Cliente:* ${clientName || "N/A"}\n`;
    message += `*Endereço:* ${clientAddress || "N/A"}\n\n`;
    message += `*Itens:*\n`;
    
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.description} (${item.code}): ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    message += `\n*Total: ${formatPrice(total)}*`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

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
              <div key={getItemKey(item)} className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-catalog-code">{item.code}</p>
                    <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => onRemove(getItemKey(item))}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(getItemKey(item), item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(getItemKey(item), item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="clientName" className="text-xs">Nome do Cliente</Label>
                  <Input 
                    id="clientName" 
                    placeholder="Ex: João Silva" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clientAddress" className="text-xs">Endereço da Obra</Label>
                  <Input 
                    id="clientAddress" 
                    placeholder="Ex: Rua A, 123" 
                    value={clientAddress} 
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="w-full gap-2" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4" /> PDF
                </Button>
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleShareWhatsApp}>
                  <Share2 className="w-4 h-4" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
