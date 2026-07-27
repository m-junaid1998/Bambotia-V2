import { useCrudMutation, useGetsQuery, useLazyGetsQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";

export interface ProductsFilters {
  currentPage?: number;
  pageSize?: number;
  searchString?: string;
  sortOn?: string;
  sortDirection?: string;
  isAllRecord?: boolean;
  fromDate?: string;
  toDate?: string;
  discountFilter?: "hasDiscount" | string;
  isNewArrival?: boolean;
}

export const useProducts = (
  filters: ProductsFilters = { currentPage: 1, pageSize: 5 },
) => {
  const [crudProducts, { isLoading: isMutating }] = useCrudMutation();
  const [triggerGetById, { isFetching: isFetchingSingleProduct }] = useLazyGetsQuery();

  const {
    data: responseData,
    isLoading: isFetchingProducts,
    refetch: refetchProducts,
  } = useGetsQuery(
    { endpoint: endpoints.productRoutes.getAll, params: filters },
    { refetchOnFocus: true },
  );

  const createProduct = async (payload: FormData) => {
    try {
      const res = await crudProducts({
        endpoint: endpoints.productRoutes.create, 
        data: payload,
      }).unwrap();

      if (res?.success) {
        refetchProducts();
        const name = payload.get("name");
        toast.success(name ? `Product ${name} created successfully!` : "Product created successfully!");
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create product."));
      return { success: false, error };
    }
  };

const getProductbyId = async (id: string | number) => {
    try {
      const res = await triggerGetById({
        endpoint: endpoints.productRoutes.getById(id),
      }).unwrap();
      return { success: true, data: res?.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch product details."));
      return { success: false, error };
    }
  };

  const updateProduct = async (id: string | number, payload: FormData) => {
    try {
      const res = await crudProducts({
        endpoint: endpoints.productRoutes.update(id), 
        method: "PUT",
        data: payload,
      }).unwrap();

      if (res?.success) {
        refetchProducts();
        const name = payload.get("name");
        toast.success(name ? `Product ${name} updated successfully!` : "Product updated successfully!");
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update product."));
      return { success: false, error };
    }
  };

  const removeProduct = async (id: string | number, name: string) => {
    try {
      const res = await crudProducts({
        endpoint: endpoints.productRoutes.delete(id), 
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        refetchProducts();
        toast.success(`Product ${name} removed successfully!`);
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to remove product."));
      return { success: false, error };
    }
  };

  const togglePublished = async (
    ids: string | string[],
    currentStatus?: boolean,
  ) => {
    try {
      const targetIds = Array.isArray(ids) ? ids : [ids];
      const res = await crudProducts({
        endpoint: endpoints.productRoutes.patch, 
        method: "PATCH",
        data: { id: targetIds },
      }).unwrap();

      if (res?.success) {
        refetchProducts();
        toast.success(
          currentStatus !== undefined
            ? `Status updated to ${!currentStatus ? "Published" : "Draft"}`
            : "Product status updated successfully!"
        );
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Status change failed"));
      return { success: false, error };
    }
  };

  return {
    products: responseData?.data || [],
    pagination: responseData?.pagination || {
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 5,
      isAllRecord: true,
      searchString: ""
    },
    isFetchingProducts,
    isFetchingSingleProduct,
    isMutating,
    createProduct,
    getProductbyId,
    removeProduct,
    updateProduct,
    togglePublished,
  };
};