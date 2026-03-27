import { Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogHeaderProps {
  totalProducts: number;
  quoteCount: number;
  onQuoteOpen: () => void;
  activeTable: string;
  onTableChange: (table: string) => void;
}

export function CatalogHeader({ totalProducts, quoteCount, onQuoteOpen, activeTable, onTableChange }: CatalogHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">Catálogo de Produtos Ibratin</h1>
            <p className="text-xs text-muted-foreground">
              {activeTable === "R11" ? "Tabela R11 - Pessoa Física" : "Tabela 019"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => onTableChange("R11")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeTable === "R11" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Tabela R11
            </button>
            <button
              onClick={() => onTableChange("019")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeTable === "019" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Tabela 019
            </button>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">
            <Package className="w-4 h-4 inline mr-1" />{totalProducts} produtos
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onQuoteOpen}
            className="relative"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Orçamento
            {quoteCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {quoteCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
