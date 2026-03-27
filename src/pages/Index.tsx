import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/types/product";
import productsData from "@/data/products.json";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductDetailDialog } from "@/components/catalog/ProductDetailDialog";
import { ProductEditDialog } from "@/components/catalog/ProductEditDialog";
import { ProductAddDialog } from "@/components/catalog/ProductAddDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const baseProducts = productsData as Product[];

const normalize = (value: string) => value.trim().toLowerCase();

const Index = () => {
  const [activeTable, setActiveTable] = useState("R11");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas as Categorias");
  const [unit, setUnit] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [edits, setEdits] = useState<Record<string, { code: string; price: number }>>({});
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [deletedKeys, setDeletedKeys] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("ibratin-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const productKey = (p: Product) => `${p.table ?? "R11"}|${p.code}|${p.description}`;

  const allProducts = useMemo(() => {
    const edited = baseProducts.map((p) => {
      const key = productKey(p);
      const edit = edits[key];
      if (edit) return { ...p, code: edit.code, price: edit.price };
      return p;
    });
    return [...edited, ...addedProducts].filter((p) => !deletedKeys.has(productKey(p)));
  }, [edits, addedProducts, deletedKeys]);

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
    const editKey = productKey(keyBase);
    setEdits((prev) => ({ ...prev, [editKey]: updated }));
  }, []);

  const handleAddProduct = useCallback((product: Product) => {
    setAddedProducts((prev) => [...prev, product]);
    toast({ title: "Produto adicionado", description: product.description });
  }, []);

  const handleDeleteProduct = useCallback((product: Product) => {
    const key = productKey(product);
    setDeletedKeys((prev) => new Set(prev).add(key));
    setAddedProducts((prev) => prev.filter((p) => productKey(p) !== key));
    toast({ title: "Produto excluído", description: product.description, variant: "destructive" });
  }, []);

  const handleToggleFavorite = useCallback((key: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem("ibratin-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const favoritesCountForTable = useMemo(() => {
    return [...favorites].filter((k) => k.startsWith(activeTable)).length;
  }, [favorites, activeTable]);

  const displayProducts = useMemo(() => {
    if (!showFavorites) return filtered;
    return filtered.filter((p) => favorites.has(productKey(p)));
  }, [filtered, showFavorites, favorites]);

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader
        totalProducts={tableProducts.length}
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <span className="inline-block w-4 h-4">🔍</span>
            {displayProducts.length} produtos encontrados
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Heart className={`w-4 h-4 mr-1 ${showFavorites ? "fill-current" : ""}`} />
              Favoritos
              {favorites.size > 0 && (
                <span className="ml-1 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5">
                  {[...favorites].filter((k) => k.startsWith(activeTable)).length}
                </span>
              )}
            </Button>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
        <ProductGrid
          products={displayProducts}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          productKey={productKey}
          onDetails={setSelectedProduct}
          onEdit={setEditingProduct}
          onDelete={handleDeleteProduct}
        />
      </main>
      <ProductDetailDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ProductEditDialog
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditSave}
      />
      <ProductAddDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddProduct}
        activeTable={activeTable}
        categories={tableCategories}
      />
    </div>
  );
};

export default Index;
