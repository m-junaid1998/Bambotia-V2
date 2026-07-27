import { useMemo } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  Truck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export interface CartItem {
  _id?: string;
  product: {
    _id: string;
    name: string;
    salePrice: number;
    images: string[];
    category?: string;
    subcategory?: string;
    stock?: number;
  };
  qty: number;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CartItem[];
  isLoading?: boolean;
}

const CartDrawer = ({
  open,
  onOpenChange,
  items,
  isLoading: isParentLoading,
}: CartDrawerProps) => {
  const {
    cartItems: hookItems,
    isGetLoading,
    isCreating,
    isDeleting,
    addToCart,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();
  const isMutating = isCreating || isDeleting;
  const currentLoadingState = isParentLoading || isGetLoading;

  const activeCartItems = items || hookItems || [];

  const cartCount = useMemo(() => {
    return activeCartItems.reduce((acc, item) => acc + (item.qty || 0), 0);
  }, [activeCartItems]);

  const cartTotal = useMemo(() => {
    return activeCartItems.reduce((acc, item) => {
      const price = item.product?.salePrice || 0;
      return acc + price * (item.qty || 0);
    }, 0);
  }, [activeCartItems]);

  const SHIPPING_THRESHOLD = 3000;
  const remaining = Math.max(0, SHIPPING_THRESHOLD - cartTotal);
  const progress = Math.min(100, (cartTotal / SHIPPING_THRESHOLD) * 100);

  const handleDecreaseQuantity = async (
    currentQty: number,
    productDetails: { id: string; name: string },
  ) => {
    if (isMutating) return;

    if (currentQty > 1) {
      await addToCart({
        product: productDetails.id,
        productName: productDetails.name,
        qty: currentQty - 1,
        isDirectUpdate: true,
      });

      toast.success(
        `${productDetails.name} Quantity updated (${currentQty} → ${currentQty - 1})`,
      );
    } else {
      await removeFromCart(productDetails.id, productDetails.name);
    }
  };

  const handleIncreaseQuantity = async (item: CartItem) => {
    if (isMutating || !item.product) return;

    const productStock = item.product.stock ?? 0;
    const targetQty = item.qty + 1;
    if (targetQty > productStock) {
      toast.warning(
        `Cannot add more! Only ${productStock} units available in stock.`,
      );
      return;
    }

    await addToCart({
      product: item.product._id,
      productName: item.product.name,
      qty: targetQty,
      isDirectUpdate: true,
    });

    toast.success(
      `${item.product.name} quantity updated (${item.qty} → ${targetQty})`,
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="
        flex flex-col w-full sm:max-w-md
        bg-background text-foreground border-l border-border
        rounded-l-2xl shadow-xl
        [&>button]:top-1.5
        [&>button]:right-2.5
        [&>button]:size-4
        [&>button]:flex
        [&>button]:items-center
        [&>button]:justify-center
        [&>button]:rounded-full
        [&>button]:bg-red-500
        [&>button]:text-white
        [&>button]:opacity-100
        [&>button>svg]:size-3
  "
      >
        <SheetHeader>
          <SheetTitle className="font-serif text-xl tracking-wide flex items-center justify-between">
            <span>Shopping Bag</span>
            <span className="text-sm font-sans font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Your cart items
          </SheetDescription>
        </SheetHeader>

        {currentLoadingState && activeCartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="tracking-wide">Loading your bag...</p>
          </div>
        ) : activeCartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-muted-foreground/80" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground tracking-wide">
                Your bag is empty
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add items to get started
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 text-xs tracking-wider uppercase cursor-pointer"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {activeCartItems.length > 0 && (
              <div className="border border-border/40 bg-[#061512] rounded-2xl p-3 mx-2 mr-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  {remaining > 0 ? (
                    <span>
                      You're{" "}
                      <span className="font-semibold text-accent">
                        PKR {remaining.toLocaleString()}
                      </span>{" "}
                      away from free shipping
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-400 flex items-center gap-2">
                      You've unlocked free shipping
                      <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <Progress
                    value={progress}
                    className="h-2 w-full bg-[#1b2a26] rounded-full"
                  />
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto scrollbar-premium pr-2 space-y-4 py-2 ">
              {activeCartItems.map((item, idx) => {
                const itemKey =
                  item._id || item.product?._id || `cart-item-${idx}`;
                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 group bg-card/40 p-2.5 border border-border/40 rounded-2xl relative transition-all duration-200"
                  >
                    <img
                      src={
                        item.product?.images?.[0] || "/placeholder-product.webp"
                      }
                      alt={item.product?.name || "Product Image"}
                      className="w-20 h-24 object-cover rounded-xl bg-muted border border-border shrink-0 shadow-2xs"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div>
                        <h4 className="text-sm text-foreground font-medium truncate tracking-wide">
                          {item.product?.name}
                        </h4>
                        <p className="text-sm text-accent font-semibold font-mono mt-1">
                          PKR {item.product?.salePrice?.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-xl bg-background shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecreaseQuantity(item.qty, {
                                id: item.product?._id || "",
                                name: item.product?.name || "",
                              })
                            }
                            disabled={isMutating}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-xs w-7 text-center font-semibold font-mono select-none text-foreground">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIncreaseQuantity(item)}
                            disabled={isMutating}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.product?._id || "",
                              item.product?.name || "",
                            )
                          }
                          disabled={isMutating}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-xl hover:bg-destructive/5 disabled:opacity-40 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-auto border-t border-border bg-background">
              <div className="flex justify-between items-baseline py-2 mb-3">
                <span className="text-xs tracking-[0.15em] font-semibold text-muted-foreground uppercase">
                  Est. Total
                </span>
                <span className="text-xl font-bold text-accent font-mono tracking-tight">
                  PKR {cartTotal.toLocaleString()}
                </span>
              </div>

              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/checkout");
                }}
                disabled={isMutating || activeCartItems.length === 0}
                className="w-full h-12 text-xs tracking-[0.18em] font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-md rounded-xl transition-all cursor-pointer uppercase"
              >
                {isMutating ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Bag...
                  </span>
                ) : (
                  "Proceed To Checkout"
                )}
              </Button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full text-center text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors mt-3.5 pb-1 font-medium cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
