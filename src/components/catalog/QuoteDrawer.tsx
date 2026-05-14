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
  onUpdatePrice: (itemKey: string, price: number) => void;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const getItemKey = (item: Pick<QuoteItem, "code" | "table">) => `${item.table ?? "R11"}|${item.code}`;

export function QuoteDrawer({ open, onOpenChange, items, onRemove, onUpdateQuantity, onUpdatePrice }: QuoteDrawerProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [shippingRate, setShippingRate] = useState(0.45);
  const [totalWeight, setTotalWeight] = useState(0);
  
  const itemsTotal = items.reduce((sum, i) => sum + (i.customPrice ?? i.price) * i.quantity, 0);
  const shippingTotal = shippingRate * totalWeight;
  const total = itemsTotal + shippingTotal;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

    // Logo/Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red
    doc.text("IBRATIN", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Lojas Galeguinho", 105, 28, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Orçamento de Produtos", 105, 38, { align: "center" });

    // Client Info
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${dateStr}`, 15, 50);
    doc.text(`Vendedor: ${sellerName || "N/A"}`, 15, 57);
    doc.text(`Cliente: ${clientName || "N/A"}`, 15, 64);
    doc.text(`Telefone: ${clientPhone || "N/A"}`, 15, 71);
    doc.text(`Endereço: ${clientAddress || "N/A"}`, 15, 78);

    // Table
    autoTable(doc, {
      startY: 85,
      head: [["Código", "Descrição", "Unid", "Qtd", "Preço Unit", "Subtotal"]],
      body: items.map(item => {
        const price = item.customPrice ?? item.price;
        return [
          item.code,
          item.description,
          item.unit,
          item.quantity,
          formatPrice(price),
          formatPrice(price * item.quantity)
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text(`Subtotal Itens: ${formatPrice(itemsTotal)}`, 140, finalY);
    if (shippingTotal > 0) {
      doc.text(`Frete (${totalWeight}kg x ${formatPrice(shippingRate)}/kg): ${formatPrice(shippingTotal)}`, 140, finalY + 7);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL GERAL: ${formatPrice(total)}`, 140, finalY + 16);
    } else {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL GERAL: ${formatPrice(total)}`, 140, finalY + 10);
    }

    doc.save(`orcamento_${clientName.replace(/\s+/g, "_") || "ibratin"}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const dateStr = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    let message = `*Olá, segue meu orçamento Ibratin - Lojas Galeguinho (${dateStr})*\n\n`;
    message += `*Vendedor:* ${sellerName || "N/A"}\n`;
    message += `*Cliente:* ${clientName || "N/A"}\n`;
    message += `*Telefone:* ${clientPhone || "N/A"}\n`;
    message += `*Endereço:* ${clientAddress || "N/A"}\n\n`;
    message += `*Itens:*\n`;
    
    items.forEach(item => {
      const price = item.customPrice ?? item.price;
      message += `- ${item.quantity}x ${item.description} (${item.code}): ${formatPrice(price * item.quantity)}\n`;
    });
    
    message += `\n*Subtotal Itens: ${formatPrice(itemsTotal)}*`;
    if (shippingTotal > 0) {
      message += `\n*Frete (${totalWeight}kg x ${formatPrice(shippingRate)}/kg): ${formatPrice(shippingTotal)}*`;
    }
    message += `\n*TOTAL GERAL: ${formatPrice(total)}*`;
    
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(getItemKey(item), item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(getItemKey(item), item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="relative max-w-[100px]">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-7 pl-6 pr-1 text-xs text-right"
                        value={item.customPrice ?? item.price}
                        onChange={(e) => onUpdatePrice(getItemKey(item), parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0 min-w-[70px] text-right">
                      {formatPrice((item.customPrice ?? item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Cálculo de Frete</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalWeight" className="text-[10px]">Peso Total (kg)</Label>
                    <Input 
                      id="totalWeight" 
                      type="number"
                      placeholder="Ex: 100" 
                      value={totalWeight || ""} 
                      onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shippingRate" className="text-[10px]">Valor por kg (R$)</Label>
                    <Input 
                      id="shippingRate" 
                      type="number"
                      step="0.01"
                      placeholder="0,45" 
                      value={shippingRate} 
                      onChange={(e) => setShippingRate(parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                {shippingTotal > 0 && (
                  <div className="flex justify-between items-center text-sm border-t border-muted-foreground/10 pt-2">
                    <span className="text-muted-foreground">Total Frete:</span>
                    <span className="font-semibold text-foreground">{formatPrice(shippingTotal)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Itens: {formatPrice(itemsTotal)}</span>
                  <span className="text-sm font-medium text-foreground">Total Geral</span>
                </div>
                <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sellerName" className="text-xs">Nome do Vendedor</Label>
                  <Input 
                    id="sellerName" 
                    placeholder="Ex: Carlos Oliveira" 
                    value={sellerName} 
                    onChange={(e) => setSellerName(e.target.value)}
                    className="h-9"
                  />
                </div>
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
                  <Label htmlFor="clientPhone" className="text-xs">Telefone do Cliente</Label>
                  <Input 
                    id="clientPhone" 
                    placeholder="Ex: (00) 00000-0000" 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)}
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
