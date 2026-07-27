import { FC, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import WishlistButton from "@/components/WishlistButton";
import { calculateDiscount, slugify, formatTitleCase } from "@/utils/helper";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart: (product: Product, redirect?: boolean) => void;
}

const ProductCard: FC<ProductCardProps> = ({
  product: p,
  index = 0,
  onAddToCart,
}) => {
  const isOutOfStock = p?.stock <= 0;
  const productPath = `/product/${slugify(p?.name || "")}/${p?._id}`;

  const discountPercent = useMemo(
    () => calculateDiscount(p?.regularPrice, p?.salePrice),
    [p?.regularPrice, p?.salePrice],
  );

  const breadcrumbText = useMemo(() => {
    const cat =
      typeof p?.categoryname === "object"
        ? p?.categoryname?.categoryname
        : p?.categoryname;
    const cleanCat = formatTitleCase(cat || "");
    const cleanSub =
      p?.subCategory && p.subCategory !== "None"
        ? formatTitleCase(p.subCategory)
        : "";

    return cleanSub ? `${cleanCat} / ${cleanSub}` : cleanCat;
  }, [p?.categoryname, p?.subCategory]);

  return (
    <AnimateOnScroll animation="fade-up" delay={index * 100}>
      <article className="group relative flex flex-col h-full rounded-xl sm:rounded-2xl bg-card/70 backdrop-blur-md border border-border overflow-hidden shadow-[0_4px_24px_-8px_hsl(var(--foreground)/0.08)] hover:shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.18)] hover:-translate-y-1 hover:border-accent transition-all duration-300">
        <Link
          to={productPath}
          className="relative block aspect-square overflow-hidden bg-muted/40"
        >
          {p?.isNewArrival && (
            <span className="absolute top-1 left-1 sm:top-2 sm:left-2  z-10 px-2 py-0.5 text-[8px] sm:text-[10px] font-bold tracking-[0.16em] bg-accent text-accent-foreground rounded-full uppercase shadow">
              NEW
            </span>
          )}
          <img
            src={p?.images?.[0]}
            alt={p?.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            width={400}
            height={400}
            loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index < 2 ? "high" : "auto"}
            decoding="async"
          />
          <WishlistButton
            productId={p?._id}
            productName={p?.name}
            className="absolute  top-0.5  right-0.5  sm:top-2  sm:right-2  scale-90 sm:scale-100 z-10"
          />
        </Link>

        <div className="flex flex-col flex-1 gap-1 p-3 sm:p-5 min-w-0">
          <Link to={productPath} className="min-w-0">
            <h3 className="text-xs sm:text-sm md:text-base font-serif text-foreground truncate group-hover:text-accent transition-colors">
              {p?.name}
            </h3>
          </Link>

          <p className="text-xs sm:text-xs text-muted-foreground line-clamp-1 capitalize">
            {breadcrumbText}
          </p>

          <div className="flex items-center justify-between text-[11px] sm:text-[14px] my-1">
            <div className="text-muted-foreground">
              Stock:{" "}
              <span
                className={
                  isOutOfStock
                    ? "text-destructive font-semibold"
                    : "text-foreground"
                }
              >
                {isOutOfStock ? "Out of Stock" : `${p.stock} left`}
              </span>
            </div>
            {discountPercent > 0 && (
              <span className="bg-destructive text-destructive-foreground px-1 py-0.4 rounded-full  whitespace-nowrap">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-4 mt-auto ">
            {p?.regularPrice > p?.salePrice && (
              <span className="text-[9px] sm:text-[13px] text-muted-foreground line-through">
                PKR. {p.regularPrice?.toLocaleString()}
              </span>
            )}
            <span className="text-[12px] sm:text-[15px] font-bold text-foreground">
              PKR. {p?.salePrice?.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(p, false)}
              className="w-full h-9 sm:h-10 inline-flex items-center justify-center gap-1 rounded-full border border-border text-foreground text-[10px] sm:text-xs font-semibold hover:border-accent hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(p, true)}
              className="w-full h-9 sm:h-10 inline-flex items-center justify-center gap-1 rounded-full bg-accent text-accent-foreground text-[10px] sm:text-xs font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" /> Buy Now
            </button>
          </div>
        </div>
      </article>
    </AnimateOnScroll>
  );
};

export default memo(ProductCard);