import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Product, QuoteItem } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface QuoteContextType {
  items: QuoteItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearQuote: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

const getItemKey = (item: Pick<QuoteItem, "code" | "table">) => `${item.table ?? "R11"}|${item.code}`;

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem("ibratin-quote");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ibratin-quote", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((prev) => {
      const key = getItemKey(product);
      const existing = prev.find((i) => getItemKey(i) === key);

      if (existing) {
        toast({
          title: "Quantidade atualizada",
          description: `Novo total: ${existing.quantity + quantity}x ${product.description}`,
        });
        return prev.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }

      toast({
        title: "Adicionado ao orçamento",
        description: `${quantity}x ${product.description}`,
      });
      return [
        ...prev,
        {
          ...product,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    setItems((prev) => prev.filter((i) => getItemKey(i) !== itemKey));
  }, []);

  const updateQuantity = useCallback((itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (getItemKey(i) === itemKey ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearQuote = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <QuoteContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}
