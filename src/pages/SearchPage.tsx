import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { endpoints } from "@/api/config";
import { useGetsQuery } from "@/api/apiSlice";
import { toast } from "sonner";
import type { Product } from "@/types";

interface FilterState {
  searchQuery: string;
  categories: string[];
  priceRange: number[];
  onlyNew: boolean;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    categories: [],
    priceRange: [0, 100000],
    onlyNew: false,
  });

  const [drafts, setDrafts] = useState<Omit<FilterState, "searchQuery">>({
    categories: [],
    priceRange: [0, 100000],
    onlyNew: false,
  });

  const { data: responseData, isFetching } = useGetsQuery(
    { endpoint: endpoints.searchRoutes.catalog, params: {} },
    { refetchOnFocus: true, refetchOnMountOrArgChange: true },
  );

  const products = useMemo(() => responseData?.data || [], [responseData]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p: Product) => {
      const cName =
        (typeof p.categoryname === "object" ? p.categoryname?.categoryname : p.categoryname) ||
        p.category;
      if (cName) cats.add(cName);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const query = filters.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.subCategory?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);

      const pCat =
        (typeof p.categoryname === "object" ? p.categoryname?.categoryname : p.categoryname) ||
        p.category ||
        "";
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(pCat);

      const price = p.salePrice || p.regularPrice || 0;
      const matchesPrice =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

      const matchesNew = !filters.onlyNew || p.isNewArrival === true;

      return matchesSearch && matchesCategory && matchesPrice && matchesNew;
    });
  }, [products, filters]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.trim() === "") {
      setFilters((prev) => ({ ...prev, searchQuery: "" }));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, searchQuery: inputValue }));
  };

  const activeCount =
    filters.categories.length +
    (filters.onlyNew ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 1 : 0);
  const hasActiveFilters = activeCount > 0;

  const handleToggleCategory = (cat: string, isDraft = false) => {
    if (isDraft) {
      setDrafts((prev) => ({
        ...prev,
        categories: prev.categories.includes(cat)
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        categories: prev.categories.includes(cat)
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      }));
    }
  };

  const resetAll = () => {
    const freshState = {
      categories: [],
      priceRange: [0, 100000],
      onlyNew: false,
    };
    setInputValue("");
    setFilters({ searchQuery: "", ...freshState });
    setDrafts(freshState);
  };

  const handleMobileSheetToggle = (open: boolean) => {
    if (open) {
      setDrafts({
        categories: filters.categories,
        priceRange: filters.priceRange,
        onlyNew: filters.onlyNew,
      });
    }
    setMobileOpen(open);
  };

  const applyMobileFilters = () => {
    setFilters((prev) => ({ ...prev, ...drafts }));
    setMobileOpen(false);
  };

  const handleAddToCartPayload = useCallback(
    async (product: Product, redirect = false) => {
      const result = await addToCart({
        product: product._id,
        productName: product.name,
        qty: 1,
        isDirectUpdate: false,
      });

      if (!result?.success) {
        return;
      }

      toast.success(
        product.name
          ? `${product.name} added to cart`
          : "Product added to your cart",
      );
      if (redirect) {
        navigate("/checkout");
      }
    },
    [addToCart, navigate],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
              Search Products
            </h1>
            <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              Find the perfect piece from our collection
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mb-12 flex gap-3 items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                autoFocus
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search for jewellery, cosmetics, bags (e.g., emerald)..."
                className="h-14 pl-12 pr-10 text-base bg-card border-border placeholder:text-xs sm:placeholder:text-sm"
              />
              {isFetching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-accent" />
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-6 font-semibold bg-accent text-accent-foreground hover:opacity-90"
            >
              Search
            </Button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <aside className="hidden lg:block bg-card border border-border rounded-md p-6 h-fit lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-foreground">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                    onClick={resetAll}
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </Button>
                )}
              </div>

              <FilterFields
                categories={uniqueCategories}
                selectedCats={filters.categories}
                priceRange={filters.priceRange}
                onlyNew={filters.onlyNew}
                onToggleCat={(cat) => handleToggleCategory(cat, false)}
                onPriceChange={(val) =>
                  setFilters((prev) => ({ ...prev, priceRange: val }))
                }
                onNewChange={(val) =>
                  setFilters((prev) => ({ ...prev, onlyNew: val }))
                }
              />

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full mt-6 gap-1"
                  onClick={resetAll}
                >
                  <X className="w-4 h-4" /> Reset all filters
                </Button>
              )}
            </aside>

            <section>
              <div className="flex items-center justify-between mb-6 gap-4">
                <Sheet open={mobileOpen} onOpenChange={handleMobileSheetToggle}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" /> Filters
                      {activeCount > 0 && (
                        <Badge className="ml-1 h-5 px-1.5 bg-accent text-accent-foreground hover:bg-accent">
                          {activeCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full sm:max-w-sm flex flex-col p-0"
                  >
                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                      <SheetTitle className="font-serif text-2xl text-left">
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <FilterFields
                        categories={uniqueCategories}
                        selectedCats={drafts.categories}
                        priceRange={drafts.priceRange}
                        onlyNew={drafts.onlyNew}
                        onToggleCat={(cat) => handleToggleCategory(cat, true)}
                        onPriceChange={(val) =>
                          setDrafts((prev) => ({ ...prev, priceRange: val }))
                        }
                        onNewChange={(val) =>
                          setDrafts((prev) => ({ ...prev, onlyNew: val }))
                        }
                      />
                    </div>
                    <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-3 sm:flex-row sm:justify-stretch">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={resetAll}
                      >
                        Reset
                      </Button>
                      <Button className="flex-1" onClick={applyMobileFilters}>
                        Apply
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-3 ml-auto">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex h-8 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={resetAll}
                    >
                      <X className="w-3.5 h-3.5" /> Clear
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-24 border border-border rounded-md bg-card/50">
                  <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground">No matching products found</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try checking description keywords or clear filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3  gap-6">
                  {filteredProducts.map((product: Product, idx: number) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={idx}
                      onAddToCart={handleAddToCartPayload}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

interface FilterFieldsProps {
  categories: string[];
  selectedCats: string[];
  priceRange: number[];
  onlyNew: boolean;
  onToggleCat: (cat: string) => void;
  onPriceChange: (val: number[]) => void;
  onNewChange: (val: boolean) => void;
}

const FilterFields = ({
  categories,
  selectedCats,
  priceRange,
  onlyNew,
  onToggleCat,
  onPriceChange,
  onNewChange,
}: FilterFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Categories
        </h3>
        <div className="space-y-2.5">
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No categories available
            </p>
          ) : (
            categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={selectedCats.includes(cat)}
                  onCheckedChange={() => onToggleCat(cat)}
                />
                <label
                  htmlFor={`cat-${cat}`}
                  className="text-sm text-foreground font-medium cursor-pointer select-none"
                >
                  {cat}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Filter
          </h3>
          <span className="text-xs font-medium text-muted-foreground">
            Rs. {priceRange[0]} - {priceRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={100000}
          step={500}
          value={priceRange}
          onValueChange={onPriceChange}
          className="my-4"
        />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Checkbox
          id="onlyNew"
          checked={onlyNew}
          onCheckedChange={(checked) => onNewChange(!!checked)}
        />
        <label
          htmlFor="onlyNew"
          className="text-sm font-medium text-foreground cursor-pointer select-none"
        >
          New Arrivals Only
        </label>
      </div>
    </div>
  );
};

export default SearchPage;
