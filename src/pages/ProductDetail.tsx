import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "@/components/ProductReviews";
import Seo from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { CartItem, Product } from "@/types";
import { slugify } from "@/utils/helper";

const ProductDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getProductbyId, isFetchingSingleProduct: isLoading } = useProducts();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!id) return;

    getProductbyId(id).then((res) => {
      if (res?.success && res.data) {
        setProduct(res.data);
        setQuantity(1);
        setSelectedImage(0);
        if (scrollContainerRef.current)
          scrollContainerRef.current.scrollLeft = 0;
        if (thumbnailsContainerRef.current)
          thumbnailsContainerRef.current.scrollLeft = 0;
      }
    });
  }, [id]);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <Skeleton className="w-full aspect-square rounded-sm" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const categoryLabel =
    typeof product.categoryname === "object"
      ? product.categoryname?.categoryname
      : product.categoryname || "Ladies Bags";

  const subsubcategoryLabel =
    product.subcategoryname || product.subCategory || "";
  const seoTitle = product?.name
    ? `${product.name}${categoryLabel ? ` — ${categoryLabel}` : ""}`
    : "BAMBOTIA";
  const seoDescription = product.description?.replace(/\s+/g, " ").trim() || "";

  const handleIncrement = () => {
    if (quantity >= product.stock) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (product.stock <= 0) {
      toast.error(`This ${product.name} is currently out of stock`);
      return;
    }

    const existingCartItem = cartItems?.find(
      (item: CartItem) => (typeof item.product === "object" ? item.product?._id : item.product) === product._id,
    );
    const existingQty = existingCartItem ? existingCartItem.qty : 0;

    if (existingQty + quantity > product.stock) {
      toast.error(
        `Total items in cart (${existingQty}) + selection (${quantity}) exceeds available stock.`,
      );
      return;
    }

    try {
      const result = await addToCart({
        product: product._id,
        productName: product.name,
        qty: existingQty + quantity,
        isDirectUpdate: true,
      });

      if (result?.success) {
        toast.success(
          product.name
            ? `${product.name} added to cart`
            : "Product added to your cart",
        );
        setQuantity(1);
        if (redirectToCheckout) {
          navigate("/checkout");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
    const mainContainer = scrollContainerRef.current;
    if (mainContainer) {
      isScrollingRef.current = true;
      mainContainer.scrollTo({
        left: index * mainContainer.clientWidth,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }

    const thumbContainer = thumbnailsContainerRef.current;
    if (thumbContainer) {
      const activeThumbnail = thumbContainer.children[index] as HTMLElement;
      if (activeThumbnail) {
        thumbContainer.scrollTo({
          left:
            activeThumbnail.offsetLeft -
            thumbContainer.clientWidth / 2 +
            activeThumbnail.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  const handleScroll = () => {
    if (isScrollingRef.current) return;
    const container = scrollContainerRef.current;
    if (container) {
      const elementWidth = container.clientWidth;
      if (elementWidth > 0) {
        const newIndex = Math.round(container.scrollLeft / elementWidth);
        if (
          newIndex !== selectedImage &&
          newIndex >= 0 &&
          newIndex < (product.images?.length || 0)
        ) {
          setSelectedImage(newIndex);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={product.images?.[0]}
        type="product"
      />

      <main className="pt-20 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-6 md:mb-8">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link
              to={`/category/${slugify(categoryLabel)}`}
              className="hover:text-accent transition-colors"
            >
              {categoryLabel}
            </Link>
            {subsubcategoryLabel && (
              <>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <Link
                  to={`/category/${slugify(categoryLabel)}/${slugify(subsubcategoryLabel)}`}
                  className="hover:text-accent transition-colors"
                >
                  {subsubcategoryLabel}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Gallery Frame */}
            <div className="flex flex-col gap-4 w-full">
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-sm bg-muted border border-border">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x touch-pan-y"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {product.images?.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="w-full h-full flex-shrink-0 snap-start snap-always"
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                        draggable="false"
                      />
                    </div>
                  ))}
                </div>

                {product.discount && (
                  <div className="absolute bottom-1 left-1 bg-red-500/90 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-md">
                    -{product.discount} OFF
                  </div>
                )}
              </div>

              {product.images?.length > 1 && (
                <div
                  ref={thumbnailsContainerRef}
                  className="flex gap-2 sm:gap-3 overflow-x-auto pt-2 pb-3 snap-x snap-mandatory touch-auto scrollbar-none"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {product.images?.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleThumbnailClick(i)}
                      className={`relative w-16 sm:w-20 aspect-[4/5] flex-shrink-0 rounded overflow-hidden border-2 transition-all duration-300 snap-center focus:outline-none ${
                        selectedImage === i
                          ? "border-accent opacity-100 scale-95 shadow-md z-10"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col w-full mt-4 md:mt-0">
              <div className="flex items-center justify-between w-full mb-2 md:mb-3 gap-4">
                <div className="flex items-center gap-1.5 flex-wrap text-xs tracking-[0.2em] uppercase text-accent font-medium">
                  <Link
                    to={`/category/${slugify(categoryLabel)}`}
                    className="hover:underline"
                  >
                    {categoryLabel}
                  </Link>
                  {subsubcategoryLabel && (
                    <>
                      <span className="text-muted-foreground/60 select-none">
                        /
                      </span>
                      <Link
                        to={`/category/${slugify(categoryLabel)}/${slugify(subsubcategoryLabel)}`}
                        className="text-muted-foreground hover:text-accent hover:underline transition-colors"
                      >
                        {subsubcategoryLabel}
                      </Link>
                    </>
                  )}
                </div>
                {product.isNewArrival && (
                  <span className="text-[11px] tracking-[0.14em] bg-accent text-accent-foreground px-3 py-1 rounded-sm font-bold whitespace-nowrap">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 md:mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 flex-wrap mb-5 md:mb-6">
                <p className="text-xl sm:text-2xl font-medium text-accent">
                  PKR. {product.salePrice?.toLocaleString()}
                </p>
                {product.regularPrice > product.salePrice && (
                  <p className="text-sm sm:text-base text-muted-foreground line-through">
                    PKR. {product.regularPrice?.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 w-full">
                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm text-muted-foreground tracking-wider">
                    QUANTITY
                  </span>
                  <div className="flex items-center border border-border rounded bg-card">
                    <button
                      onClick={handleDecrement}
                      disabled={product.stock <= 0 || quantity <= 1}
                      className="p-2 text-foreground hover:text-accent transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm text-foreground select-none font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={product.stock <= 0 || quantity >= product.stock}
                      className="p-2 text-foreground hover:text-accent transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-serif tracking-[0.2em] uppercase sm:text-right">
                  {product.stock > 0 ? (
                    <span className="text-accent">
                      Stock Available ({product.stock} left)
                    </span>
                  ) : (
                    <span className="text-rose-500 ">Out of Stock</span>
                  )}
                </h3>
              </div>

              <div className="flex gap-3 mb-4 border-b border-border pb-6 items-center">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={product.stock <= 0}
                  className="w-full h-8 md:h-10 inline-flex items-center justify-center gap-1 rounded-full bg-accent text-accent-foreground text-[0.8em] sm:text-base font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>

                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.stock <= 0}
                  className="w-full h-8 md:h-10 inline-flex items-center justify-center gap-1 rounded-full bg-accent text-accent-foreground text-[0.8em] sm:text-base font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> Buy Now
                </button>
                <WishlistButton
                  productId={product._id}
                  productName={product.name}
                  className="w-5 h-5 md:w-10 md:h-10 rounded-full border flex-shrink-0 p-0 flex items-center justify-center hover:bg-muted"
                />
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold tracking-[0.2em] text-accent uppercase mb-3">
                  Product Description
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description &&
                  product.description.length > 250 &&
                  !isExpanded
                    ? `${product.description.slice(0, 250)}...`
                    : product.description}
                </p>
                {product.description && product.description.length > 250 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent tracking-wider uppercase mt-2 hover:underline"
                  >
                    <span>{isExpanded ? "Read Less" : "Read More"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to={`/category/${slugify(categoryLabel)}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {categoryLabel}
            </Link>
          </div>

          <ProductReviews productId={product._id} />
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
