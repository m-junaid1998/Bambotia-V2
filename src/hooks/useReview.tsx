
import { useState } from "react";
import { useUploadMutation, useGetsQuery, useCrudMutation} from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { getApiErrorMessage } from "@/api/types";

export const useReview = (productId: string) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [uploadReview, { isLoading: isReviewSubmitLoading }] = useUploadMutation();
  const [deleteReview] = useCrudMutation();

  const {
    data: responseData,
    isLoading: isFetching,
    refetch: refetchReviews,
  } = useGetsQuery(
    { endpoint: endpoints.reviewRoutes.getByProduct(productId) },
    { refetchOnFocus: true, skip: !productId }
  );


  const createReview = async (payload: FormData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      toast.error("Please login to submit a review.");
      return { success: false };
    }

    if (!productId) {
      toast.error("Product ID is required.");
      return { success: false };
    }

    try {
      const res = await uploadReview({
        endpoint: endpoints.reviewRoutes.create(productId),
        data: payload,
      }).unwrap();

      if (res?.success) {
        await refetchReviews();
        toast.success(res?.message || "Review submitted successfully.");
        return { success: true, data: res?.data };
      }
      return { success: false };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to add review."));
      return { success: false, error };
    }
  };

  const deleteReviewAsync = async (reviewId: string | number) => {
    if (!productId || !reviewId) {
      toast.error("Review identifiers missing.");
      return { success: false };
    }

    try {
      const isAdmin = currentUser?.role === "admin";
      const endpoint = isAdmin
        ? endpoints.reviewRoutes.deleteByAdmin(reviewId)
        : endpoints.reviewRoutes.deleteByUser(reviewId);

      const res = await deleteReview({
        endpoint,
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        await refetchReviews();
        toast.success("Review deleted successfully.");
        return { success: true };
      }
      return { success: false };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete review."));
      return { success: false, error };
    }
  };

  return {
    reviews: responseData?.data ?? [],
    isFetching,
    isReviewSubmitLoading,
    currentUser,
    isAuthModalOpen,
    refetchReviews,
    createReview,
    deleteReviewAsync,
    setIsAuthModalOpen,
  };
};