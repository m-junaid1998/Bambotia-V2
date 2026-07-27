import { useState, useRef, useEffect, useMemo, useCallback, FC } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { slugify, formatTitleCase } from "@/utils/helper";
import type { Product, CartItem, Category } from "@/types";

const SORT_CONFIG: Record<string, { sortOn: string; sortDirection: string }> = {
  "low-high": { sortOn: "salePrice", sortDirection: "asc" },
  "high-low": { sortOn: "salePrice", sortDirection: "desc" },
  name: { sortOn: "name", sortDirection: "asc" },
  discount: { sortOn: "discount", sortDirection: "desc" },
  latest: { sortOn: "createdAt", sortDirection: "desc" },
};

const extractCategoryName = (categoryname: string | Category | undefined): string => {
  if (!categoryname) return "";
  return typeof categoryname === "object"
    ? categoryname.categoryname
    : categoryname;
};

const CategoryPage: FC = () => {
  const navigate = useNavigate();
  const { category = "", subCategory = "" } = useParams<{
    category: string;
    subCategory?: string;
  }>();

  const decodedCategory = useMemo(
    () => decodeURIComponent(category),
    [category],
  );
  const decodedSubCategory = useMemo(
    () => decodeURIComponent(subCategory),
    [subCategory],
  );

  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addToCart, cartItems = [] } = useCart();

  const apiFilters = useMemo(() => {
    const { sortOn, sortDirection } = SORT_CONFIG[sortBy] || SORT_CONFIG.latest;
    const trimmedSearch = searchQuery.trim();

    return {
      isAllRecord: true,
      sortOn,
      sortDirection,
      category: decodedCategory || undefined,
      ...(decodedSubCategory && { subCategory: decodedSubCategory }),
      ...(trimmedSearch && { searchString: trimmedSearch }),
    };
  }, [sortBy, searchQuery, decodedCategory, decodedSubCategory]);

  const { products: rawProducts = [], isFetchingProducts } =
    useProducts(apiFilters);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(rawProducts)) return [];

    const sluggedCategory = slugify(decodedCategory);
    const sluggedSubCategory = decodedSubCategory
      ? slugify(decodedSubCategory)
      : "";

    return rawProducts.filter((p: Product) => {
      if (p?.isPublished === false) return false;

      const matchCat =
        slugify(extractCategoryName(p?.categoryname)) === sluggedCategory;
      const matchSub = sluggedSubCategory
        ? slugify(p?.subCategory || "") === sluggedSubCategory
        : true;

      return matchCat && matchSub;
    });
  }, [rawProducts, decodedCategory, decodedSubCategory]);

  useEffect(() => {
    setSearchQuery("");
    if (searchInputRef.current) searchInputRef.current.value = "";
  }, [category, subCategory]);

  const syncSearchTrigger = () =>
    setSearchQuery(searchInputRef.current?.value.trim() || "");

  const handleAddToCart = useCallback(
    async (product: Product, redirect = false) => {
      try {
        const currentStock = product?.stock ?? 0;

        if (currentStock <= 0) {
          toast.error("This item is currently out of stock!");
          return;
        }

        const existingCartItem = cartItems.find((item: CartItem) => {
          const targetId =
            typeof item.product === "object" ? item.product?._id : item.product;
          return targetId === product._id;
        });

        const currentCartQty = existingCartItem ? existingCartItem.qty : 0;

        if (currentCartQty + 1 > currentStock) {
          toast.error(
            `Cannot add more! Only ${currentStock} units available in stock.`,
          );
          return;
        }

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
      } catch {
        toast.error("Cart handling error");
      }
    },
    [cartItems, addToCart, navigate],
  );

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-white">
        Category Not Found
      </div>
    );
  }

  const currentTitle = subCategory ? decodedSubCategory : decodedCategory;

  return (
    <div className="min-h-screen bg-card text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            to={`/category/${slugify(decodedCategory)}`}
            className={`hover:text-accent transition-colors capitalize ${!subCategory ? "text-foreground font-medium" : ""}`}
          >
            {formatTitleCase(decodedCategory)}
          </Link>
          {subCategory && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium capitalize">
                {formatTitleCase(decodedSubCategory)}
              </span>
            </>
          )}
        </nav>

        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-accent mb-3 font-medium">
            {subCategory ? "SUB COLLECTION" : "COLLECTION"}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-3 tracking-wide capitalize">
            {formatTitleCase(currentTitle)}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base font-light">
            Explore our exclusive range of {formatTitleCase(currentTitle)}{" "}
            crafted for luxury.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mb-12 backdrop-blur-sm flex flex-col gap-3 lg:flex-row lg:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              onKeyDown={(e) => e.key === "Enter" && syncSearchTrigger()}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-black/20 text-sm outline-none focus:border-accent/50 text-white placeholder:text-white/30 placeholder:text-xs sm:placeholder:text-sm"
            />
          </div>
          <div className="relative lg:w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 w-full px-4 pr-10 rounded-xl border border-white/10 bg-card text-sm text-white outline-none cursor-pointer appearance-none focus:border-accent/50"
            >
              <option value="latest">Latest</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="discount">Top Discounts</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-4 h-4 text-white/70"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 8l4 4 4-4" />
              </svg>
            </div>
          </div>
          <button
            onClick={syncSearchTrigger}
            className="h-11 px-6 bg-accent text-accent-foreground font-medium rounded-xl text-sm hover:bg-accent/90 transition-colors"
          >
            Search
          </button>
        </div>

        {isFetchingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full h-80 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
            <p className="text-white/40">
              No items found under this collection criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {filteredProducts.map((p: Product, i: number) => (
              <ProductCard
                key={p._id}
                product={p}
                index={i}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        <div className="mt-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
