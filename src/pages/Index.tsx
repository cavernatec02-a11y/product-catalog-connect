import { useState, useMemo } from "react";
import type { Product, QuoteItem } from "@/types/product";
import productsData from "@/data/products.json";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { QuoteDrawer } from "@/components/catalog/QuoteDrawer";
import { ProductDetailDialog } from "@/components/catalog/ProductDetailDialog";

const allProducts = productsData as Product[];

const normalize = (value: string) => value.trim().toLowerCase();

const Index = () => {
  const [activeTable, setActiveTable] = useState("R11");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas as Categorias");
  const [unit, setUnit] = useState("Todos");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const normalizedProducts = useMemo(() => {
    const seen = new Set<string>();

    return allProducts.filter((product) => {
      const table = product.table ?? "R11";
      const key = `${table}|${product.code}|${product.description}|${product.unit}|${product.price}|${product.category}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const tableProducts = useMemo(
    () => normalizedProducts.filter((product) => (product.table ?? "R11") === activeTable),
    [activeTable, normalizedProducts],
  );

  const tableCategories = useMemo(
    () => ["Todas as Categorias", ...Array.from(new Set(tableProducts.map((product) => product.category)))],
    [tableProducts],
  );

  const tableUnits = useMemo(
    () => ["Todos", ...Array.from(new Set(tableProducts.map((product) => product.unit).filter(Boolean)))],
    [tableProducts],
  );

  const handleTableChange = (table: string) => {
    setActiveTable(table);
    setCategory("Todas as Categorias");
    setUnit("Todos");
    setSearch("");
  };

  const filtered = useMemo(() => {
    const normalizedSearch = normalize(search);
    const normalizedCategory = normalize(category);
    const normalizedUnit = normalize(unit);

    return tableProducts.filter((product) => {
      const matchSearch =
        !normalizedSearch ||
        normalize(product.code).includes(normalizedSearch) ||
        normalize(product.description).includes(normalizedSearch);
      const matchCat =
        normalizedCategory === normalize("Todas as Categorias") ||
        normalize(product.category) === normalizedCategory;
      const matchUnit = normalizedUnit === normalize("Todos") || normalize(product.unit) === normalizedUnit;

      return matchSearch && matchCat && matchUnit;
    });
  }, [search, category, unit, tableProducts]);

  const addToQuote = (product: Product) => {
    setQuoteItems((prev) => {
      const existing = prev.find((item) => item.code === product.code);

      if (existing) {
        return prev.map((item) => (item.code === product.code ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromQuote = (code: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.code !== code));
  };

  const updateQuantity = (code: string, qty: number) => {
    if (qty < 1) return removeFromQuote(code);

    setQuoteItems((prev) => prev.map((item) => (item.code === code ? { ...item, quantity: qty } : item)));
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader
        totalProducts={tableProducts.length}
        quoteCount={quoteItems.length}
        onQuoteOpen={() => setQuoteOpen(true)}
        activeTable={activeTable}
        onTableChange={handleTableChange}
      />
      <main className="container mx-auto px-4 py-6">
        <CatalogFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={tableCategories}
          unit={unit}
          onUnitChange={setUnit}
          units={tableUnits}
        />
        <p className="text-muted-foreground text-sm mb-4 flex items-center gap-2">
          <span className="inline-block w-4 h-4">🔍</span>
          {filtered.length} produtos encontrados
        </p>
        <ProductGrid products={filtered} onSelect={addToQuote} onDetails={setSelectedProduct} />
      </main>
      <QuoteDrawer
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        items={quoteItems}
        onRemove={removeFromQuote}
        onUpdateQuantity={updateQuantity}
      />
      <ProductDetailDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onSelect={addToQuote} />
    </div>
  );
};

export default Index;
