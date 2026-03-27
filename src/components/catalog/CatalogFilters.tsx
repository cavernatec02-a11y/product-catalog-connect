import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
  unit: string;
  onUnitChange: (v: string) => void;
  units: string[];
}

export function CatalogFilters({
  search, onSearchChange, category, onCategoryChange, categories, unit, onUnitChange, units
}: CatalogFiltersProps) {
  return (
    <div className="bg-card rounded-xl border p-4 mb-6 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código ou descrição..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-0"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px] bg-muted border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger className="w-[120px] bg-muted border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map(u => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
