import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import cosmeticsImg from "@/assets/category-cosmetics.jpg";
import jewelleryImg from "@/assets/category-jewellery.jpg";
import pursesImg from "@/assets/category-purses.jpg";
import { slugify } from "@/utils/helper";
import type { Product } from "@/types";

type CategoryType = "jewellery" | "cosmetics" | "ladies bags";

interface StaticSectionConfig {
  id: CategoryType;
  title: string;
  subtitle: string;
  image: string;
  route: string;
}

const STATIC_SECTIONS: StaticSectionConfig[] = [
  {
    id: "jewellery",
    title: "Luxury Jewellery",
    subtitle: "EXCLUSIVE COLLECTION",
    image: jewelleryImg,
    route: `/category/${slugify("jewellery")}`,
  },
  {
    id: "cosmetics",
    title: "Professional Cosmetics",
    subtitle: "EXCLUSIVE COLLECTION",
    image: cosmeticsImg,
    route: `/category/${slugify("cosmetics")}`,
  },
  {
    id: "ladies bags",
    title: "Luxury Purses & Bags",
    subtitle: "EXCLUSIVE COLLECTION",
    image: pursesImg,
    route: `/category/${slugify("ladies bags")}`,
  },
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<CategoryType>("jewellery");

  const { products: allProducts, isFetchingProducts: isLoading } = useProducts({
    currentPage: 1,
    pageSize: 50,
    isAllRecord: false,
  });

  const handleAddToCart = useCallback(
    async (product: Product, redirectToCheckout = false) => {
      if (product?.stock <= 0) {
        toast.error(`This ${product?.name || "item"} is currently out of stock`);
        return;
      }

      const result = await addToCart({
        product: product._id,
        productName: product.name,
        qty: 1,
      });

      if (!result?.success) {
        return;
      }

      toast.success(
        product.name ? `${product.name} added to cart` : "Product added to your cart",
      );

      if (redirectToCheckout) {
        navigate("/checkout");
      }
    },
    [addToCart, navigate],
  );

  const getCleanCategoryName = (p: Product): string => {
    const cat =
      typeof p?.categoryname === "object"
        ? p?.categoryname?.categoryname
        : p?.categoryname;
    return (cat || "").toLowerCase().trim();
  };

  const categorizedProducts = useMemo(() => {
    const groups: Record<CategoryType, Product[]> = {
      jewellery: [],
      cosmetics: [],
      "ladies bags": [],
    };

    if (!allProducts || !Array.isArray(allProducts)) return groups;

    allProducts.forEach((product) => {
      const catName = getCleanCategoryName(product) as CategoryType;
      if (groups[catName] && groups[catName].length < 4) {
        groups[catName].push(product);
      }
    });

    return groups;
  }, [allProducts]);

  const filteredTabProducts = categorizedProducts[activeTab] || [];

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 md:space-y-28">
        {STATIC_SECTIONS.map((section) => {
          const sectionProducts = categorizedProducts[section.id] || [];
          return (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <AnimateOnScroll animation="fade-left">
                <Link
                  to={section.route}
                  className="group relative block overflow-hidden rounded-sm mb-8 aspect-[21/9] md:aspect-[3/1]"
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                    <p className="text-xs tracking-[0.25em] text-accent mb-2">
                      {section.subtitle}
                    </p>
                    <h2 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-2">
                      {section.title}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium group-hover:underline">
                      Explore Collection <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </AnimateOnScroll>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-card aspect-[3/4] rounded-sm"
                    />
                  ))}
                {!isLoading &&
                  sectionProducts.map((p: Product, i: number) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      index={i}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
              </div>
            </div>
          );
        })}
        <AnimateOnScroll animation="fade-in">
          <div className="w-full">
            <div className="flex justify-center mb-6 md:mb-8 px-2">
              <div className="flex w-full max-w-fit  border border-border rounded-sm">
                {(["jewellery", "cosmetics", "ladies bags"] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`flex-1 whitespace-nowrap px-4 sm:px-6 md:px-10 py-3 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] font-medium border-r border-border last:border-r-0 transition-colors ${
                        activeTab === cat
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-accent hover:bg-card"
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-card aspect-[3/4] rounded-sm"
                  />
                ))}

              {!isLoading &&
                filteredTabProducts.map((p: Product, i: number) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    index={i}
                    onAddToCart={handleAddToCart}
                  />
                ))}

              {!isLoading && filteredTabProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                  No products found in this category.
                </div>
              )}
            </div>
            {!isLoading && filteredTabProducts.length > 0 && (
              <div className="text-center mt-8 md:mt-12">
                <button
                  onClick={() => navigate(`/category/${slugify(activeTab)}`)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-full text-xs font-medium uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors min-w-[180px] justify-center"
                >
                  View More {activeTab} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default CategoriesSection;
