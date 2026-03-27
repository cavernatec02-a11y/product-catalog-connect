import { useState, useMemo, useCallback } from "react";
import type { Product, QuoteItem } from "@/types/product";
import productsData from "@/data/products.json";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { QuoteDrawer } from "@/components/catalog/QuoteDrawer";
import { ProductDetailDialog } from "@/components/catalog/ProductDetailDialog";
import { ProductEditDialog } from "@/components/catalog/ProductEditDialog";

const baseProducts = productsData as Product[];

const normalize = (value: string) => value.trim().toLowerCase();

const Index = () => {
  const [activeTable, setActiveTable] = useState("R11");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas as Categorias");
  const [unit, setUnit] = useState("Todos");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [edits, setEdits] = useState<Record<string, { code: string; price: number }>>({});

  const allProducts = useMemo(() => {
    return baseProducts.map((p) => {
      const editKey = `${p.table ?? "R11"}|${p.code}|${p.description}`;
      const edit = edits[editKey];
      if (edit) return { ...p, code: edit.code, price: edit.price };
      return p;
    });
  }, [edits]);

  const normalizedProducts = useMemo(() => {
    const seen = new Set<string>();
    return allProducts.filter((product) => {
      const table = product.table ?? "R11";
      const key = `${table}|${product.code}|${product.description}|${product.unit}|${product.price}|${product.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

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

  const handleEditSave = useCallback((original: Product, updated: { code: string; price: number }) => {
    const origProduct = baseProducts.find(
      (p) => p.code === original.code && p.description === original.description && (p.table ?? "R11") === (original.table ?? "R11")
    );
    const keyBase = origProduct || original;
    const editKey = `${keyBase.table ?? "R11"}|${keyBase.code}|${keyBase.description}`;
    setEdits((prev) => ({ ...prev, [editKey]: updated }));
  }, []);

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
        <ProductGrid
          products={filtered}
          onSelect={addToQuote}
          onDetails={setSelectedProduct}
          onEdit={setEditingProduct}
        />
      </main>
      <QuoteDrawer
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        items={quoteItems}
        onRemove={removeFromQuote}
        onUpdateQuantity={updateQuantity}
      />
      <ProductDetailDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onSelect={addToQuote} />
      <ProductEditDialog
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default Index;
