import { useCrudMutation, useGetsQuery, useUploadMutation } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";

export interface MediaFilters {
  page?: number;
  limit?: number;
  type?: "image" | "video";
}

export const useMedia = (
  filters: MediaFilters = { page: 1, limit: 10 },
) => {
  const [uploadMediaAsset, { isLoading: isUploading }] = useUploadMutation();
  const [crudMedia, { isLoading: isDeleting }] = useCrudMutation();

  const {
    data: responseData,
    isLoading: isFetchingMedia,
    refetch: refetchMedia,
  } = useGetsQuery(
    { endpoint: endpoints.mediaRoutes.getupload, params: filters },
    { refetchOnFocus: true },
  );

  const uploadMedia = async (payload: FormData) => {
    try {
      const res = await uploadMediaAsset({
        endpoint: endpoints.mediaRoutes.createupload,
        data: payload,
      }).unwrap();

      if (res?.success) {
        refetchMedia();
        toast.success(res?.message || "Media assets uploaded successfully!");
      }
      return { success: true, data: res?.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to upload media."));
      return { success: false, error };
    }
  };

  const removeMedia = async (id: string | number, title: string) => {
    try {
      const res = await crudMedia({
        endpoint: endpoints.mediaRoutes.deleteupload(id),
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        refetchMedia();
        toast.success(`Media "${title}" removed successfully!`);
      }
      return { success: true, data: res?.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to remove media."));
      return { success: false, error };
    }
  };

  return {
    mediaItems: responseData?.data || [],
    pagination: responseData?.pagination || {
      totalRecords: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
    isFetchingMedia,
    isUploading,
    isDeleting,
    uploadMedia,
    removeMedia,
  };
};