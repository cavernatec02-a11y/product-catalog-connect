import { Package } from "lucide-react";

interface CatalogHeaderProps {
  totalProducts: number;
  activeTable: string;
  onTableChange: (table: string) => void;
}

export function CatalogHeader({ totalProducts, activeTable, onTableChange }: CatalogHeaderProps) {
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
              {activeTable === "R11" ? "Tabela R11 - Pessoa Física" : activeTable === "019" ? "Tabela 019" : "Tabela G10 - Galeguinhos"}
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
            <button
              onClick={() => onTableChange("G10")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeTable === "G10" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Tabela G10
            </button>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">
            <Package className="w-4 h-4 inline mr-1" />{totalProducts} produtos
          </span>
        </div>
      </div>
    </header>
  );
}
