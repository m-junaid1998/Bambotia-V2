import { useMemo } from "react";
import { toast } from "sonner";
import { useGetsQuery, useCrudMutation } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { useAppSelector } from "@/store/hooks";
import { getApiErrorMessage } from "@/api/types";

export interface WishlistPayload {
  _id: string;
  name: string;
  salePrice: number;
  images: string[];
  category?: string;
  subcategory?: string;
}

export const AUTH_DIALOG_TRIGGER = "trigger_auth_signup_dialog";

export const useWishlist = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [toggleMutation, { isLoading: isMutating }] = useCrudMutation();

  const {
    data: wishlistResponse,
    isLoading: isWishLoading,
    refetch: loadWish,
  } = useGetsQuery(
    { endpoint: endpoints.wishlistRoutes.base },
    {
      skip: !user,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const wishlistItems = useMemo<WishlistPayload[]>(() => {
    if (!user || !wishlistResponse?.data) return [];
    
    const targetData = wishlistResponse.data;
    if (Array.isArray(targetData.products)) {
      return targetData.products;
    }
    return [];
  }, [wishlistResponse, user]);

  const isInWishlist = (productId: string): boolean => {
    if (!user) return false; 
    return wishlistItems.some((item) => String(item._id) === String(productId));
  };

  const toggleItem = async (productId: string, productName: string) => {
    if (!user) {
      toast.error("Please login to manage your wishlist");
      setTimeout(() => {
        const event = new CustomEvent(AUTH_DIALOG_TRIGGER);
        window.dispatchEvent(event);
      },1000);
      return { success: false, error: "Authentication required" };
    }

    try {
      const res = await toggleMutation({
        endpoint: endpoints.wishlistRoutes.base,
        method: "POST",
        data: { productId },
      }).unwrap();
      
      if (res?.success) {
        loadWish();
        const backendMessage = res?.message || "Wishlist updated";
        toast.success(`${productName}: ${backendMessage}`);
        
        return { success: true, data: res.data };
      }
      return { success: false };
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Could not update wishlist. Please try again."),
      );
      return { success: false, error };
    }
  };

  const hasUser = !!user;

  return {
    wishlistItems: hasUser ? wishlistItems : [],
    isInWishlist,
    isWishLoading: hasUser ? isWishLoading : false,
    isMutating,
    toggleItem,
    refetchWishlist: loadWish,
  };
};