import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

const WishlistButton = ({
  productId,
  productName,
  className = "",
}: WishlistButtonProps) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const wishlisted = isInWishlist(productId);
  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLocalLoading) return;
    setIsLocalLoading(true);
    await toggleItem(productId, productName);
    setIsLocalLoading(false);
  };

  return (
    <button
      disabled={isLocalLoading}
      onClick={handleToggle}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${
        wishlisted
          ? "bg-red-500 text-white"
          : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
      } ${isLocalLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform active:scale-90 ${
          wishlisted ? "fill-current" : ""
        } ${isLocalLoading ? "animate-pulse" : ""}`}
      />
    </button>
  );
};

export default WishlistButton;