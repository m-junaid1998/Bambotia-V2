import { useGetsQuery, useCrudMutation } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { getApiErrorMessage } from "@/api/types";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export const AUTH_DIALOG_TRIGGER = "trigger_auth_signup_dialog";

export interface CartPayload {
  product: string;
  productName?: string;
  qty: number;
  isDirectUpdate?: boolean;
}

export const useCart = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [createCartMutation, { isLoading: isCreating }] = useCrudMutation();
  const [deleteCartMutation, { isLoading: isDeleting }] = useCrudMutation();

  const {
    data: fetchedCartData,
    isLoading: isGetLoading,
    refetch: loadCart,
  } = useGetsQuery(
    { endpoint: endpoints.cartRoutes.base },
    {
      skip: !user,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const addToCart = async (cartPayload: CartPayload) => {
    if (!user) {
      toast.error("Please log in to manage your cart");

      setTimeout(() => {
        const event = new CustomEvent(AUTH_DIALOG_TRIGGER);
        window.dispatchEvent(event);
      }, 1000);

      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const res = await createCartMutation({
        endpoint: endpoints.cartRoutes.base,
        method: "POST",
        data: {
          product: cartPayload.product,
          qty: cartPayload.qty,
          isDirectUpdate: cartPayload.isDirectUpdate || false,
        },
      }).unwrap();

      if (res?.success) {
        loadCart();
      }

      return {
        success: true,
        data: res?.data,
      };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Could not add to cart. Please try again."));

      return {
        success: false,
        error,
      };
    }
  };

  const removeFromCart = async (productId: string, productName: string) => {
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const res = await deleteCartMutation({
        endpoint: endpoints.cartRoutes.removeProduct(productId),
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        loadCart();

        toast.success(
          productName
            ? `${productName} removed from your cart`
            : "Item has been removed from your cart",
        );
      }

      return {
        success: true,
        data: res?.data,
      };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to remove item from cart."));

      return {
        success: false,
        error,
      };
    }
  };

  const clearCart = async () => {
    if (!user) {
      return { success: true };
    }

    try {
      const res = await deleteCartMutation({
        endpoint: endpoints.cartRoutes.base,
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        loadCart();
      }

      return {
        success: true,
        data: res?.data,
      };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to clear cart."));

      return {
        success: false,
        error,
      };
    }
  };

  const hasUser = !!user;
  
  return {
    cartItems: hasUser ? (fetchedCartData?.data?.cartItems || []) : [],
    cartData: hasUser ? (fetchedCartData?.data || null) : null,
    isGetLoading: hasUser ? isGetLoading : false,
    isCreating,
    isDeleting,
    addToCart,
    removeFromCart,
    clearCart,
    loadCart,
  };
};