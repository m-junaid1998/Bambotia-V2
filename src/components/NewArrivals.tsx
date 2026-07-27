import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import cosmeticsImg from "@/assets/category-cosmetics.jpg";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

const NewArrivals = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [pageSize, setPageSize] = useState(10);

  const {
    products,
    pagination,
    isFetchingProducts: isLoading,
  } = useProducts({
    isNewArrival: true,
    pageSize: pageSize,
    currentPage: 1,
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
  const handleLoadMore = () => {
    setPageSize((prevSize) => prevSize + 10);
  };

  const hasMoreProducts = products.length < (pagination?.totalCount || 0);
  const isInitialLoading = isLoading && products.length === 0;

  return (
    <section id="new-arrivals" className="py-12 sm:py-16 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <AnimateOnScroll animation="fade-up">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-accent mb-2 sm:mb-3">
              JUST ARRIVED
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md md:max-w-none md:whitespace-nowrap mx-auto">
              The finest new additions — Exclusive Luxury Jewellery, Cosmetics &
              Accessories.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up">
          <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-primary via-primary to-accent/20">
            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full text-center sm:text-left">
                <div className="w-24 h-24 rounded-full border-2 border-accent/30 flex-shrink-0 overflow-hidden shadow-md mx-auto sm:mx-0">
                  <img
                    src={cosmeticsImg}
                    loading="lazy"
                    alt="Promo"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs tracking-[0.2em] font-medium text-accent uppercase">
                    FLAT DISCOUNT ON ALL ORDERS • Get Upto 30% OFF
                  </p>
                  <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
                    Beauty, Jewellery & Accessories —{" "}
                    <span className="text-accent block sm:inline">
                      All in One Place
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
                    Free shipping on orders above PKR 3,000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {isInitialLoading
            ? Array.from({ length: 8 }).map((_, n) => (
                <div
                  key={n}
                  className="space-y-4 p-4 border border-border rounded-sm bg-card"
                >
                  <Skeleton className="w-full aspect-square rounded-sm" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : products.map((p: Product, i: number) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  index={i}
                  onAddToCart={handleAddToCart}
                />
              ))}

          {isLoading &&
            products.length > 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`sub-load-${i}`}
                className="space-y-4 p-4 border border-border rounded-sm bg-card animate-pulse"
              >
                <Skeleton className="w-full aspect-square rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
        </div>

        {hasMoreProducts && !isInitialLoading && (
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="text-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 border border-border rounded-full text-sm text-foreground hover:border-accent hover:text-accent transition-colors font-medium tracking-wide disabled:opacity-70 disabled:cursor-not-allowed min-w-[220px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "View More New Arrivals"
                )}
              </button>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
