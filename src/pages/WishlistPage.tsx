import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { Heart } from "lucide-react";
import { useWishlist, type WishlistPayload } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems: items, isWishLoading: isLoading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCartAction = useCallback(
    async (productData: WishlistPayload, redirect: boolean = false) => {
      try {
        const result = await addToCart({
          product: productData._id,
          productName: productData.name,
          qty: 1,
        });
        if (!result?.success) {
          return;
        }

        toast.success(
          productData.name
            ? `${productData.name} added to cart`
            : "Product added to your cart",
        );

        if (redirect) {
          navigate("/checkout");
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed handling wishlist cart operation pipeline."));
      }
    },
    [addToCart, navigate],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs tracking-[0.3em] text-accent mb-4 uppercase">
              MY COLLECTION
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
              Wishlist
            </h1>
            <p className="text-muted-foreground text-sm">
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Your wishlist is empty
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground text-sm font-medium tracking-wider hover:opacity-90 transition-all rounded-full"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 [&_article_div.flex.items-center.justify-between.text-\[11px\]]:hidden [&_article_div.flex.items-center.justify-between.md\:text-\[14px\]]:hidden">
              {items.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCartAction}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;
