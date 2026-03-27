import { useState, useMemo } from "react";
import type { Product, QuoteItem } from "@/types/product";
import productsData from "@/data/products.json";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { QuoteDrawer } from "@/components/catalog/QuoteDrawer";
import { ProductDetailDialog } from "@/components/catalog/ProductDetailDialog";

const allProducts = productsData as Product[];
const categories = ["Todas as Categorias", ...Array.from(new Set(allProducts.map(p => p.category)))];
const units = ["Todos", ...Array.from(new Set(allProducts.map(p => p.unit).filter(Boolean)))];

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas as Categorias");
  const [unit, setUnit] = useState("Todos");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return allProducts.filter(p => {
      const matchSearch = !search || 
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Todas as Categorias" || p.category === category;
      const matchUnit = unit === "Todos" || p.unit === unit;
      return matchSearch && matchCat && matchUnit;
    });
  }, [search, category, unit]);

  const addToQuote = (product: Product) => {
    setQuoteItems(prev => {
      const existing = prev.find(i => i.code === product.code);
      if (existing) return prev.map(i => i.code === product.code ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromQuote = (code: string) => {
    setQuoteItems(prev => prev.filter(i => i.code !== code));
  };

  const updateQuantity = (code: string, qty: number) => {
    if (qty < 1) return removeFromQuote(code);
    setQuoteItems(prev => prev.map(i => i.code === code ? { ...i, quantity: qty } : i));
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader
        totalProducts={allProducts.length}
        quoteCount={quoteItems.length}
        onQuoteOpen={() => setQuoteOpen(true)}
      />
      <main className="container mx-auto px-4 py-6">
        <CatalogFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          unit={unit}
          onUnitChange={setUnit}
          units={units}
        />
        <p className="text-muted-foreground text-sm mb-4 flex items-center gap-2">
          <span className="inline-block w-4 h-4">🔍</span>
          {filtered.length} produtos encontrados
        </p>
        <ProductGrid
          products={filtered}
          onSelect={addToQuote}
          onDetails={setSelectedProduct}
        />
      </main>
      <QuoteDrawer
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        items={quoteItems}
        onRemove={removeFromQuote}
        onUpdateQuantity={updateQuantity}
      />
      <ProductDetailDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelect={addToQuote}
      />
    </div>
  );
};

export default Index;
