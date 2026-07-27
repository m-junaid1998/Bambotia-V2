import { useCrudMutation, useGetsQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";
import type { Category } from "@/types";

export interface CategoryFilters {
  currentPage?: number;
  pageSize?: number;
  searchString?: string;
  sortOn?: string;
  sortDirection?: string;
  isAllRecord?: boolean;
  fromDate?: string;
  toDate?: string;
}

export const useCategories = (
  filters: CategoryFilters = { currentPage: 1, pageSize: 5 }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [crudCategory, { isLoading: isMutating }] = useCrudMutation();

  const {
    data: responseData,
    isLoading: isFetchingCategories,
    refetch: refetchCategory,
  } = useGetsQuery(
    { endpoint: endpoints.categoryRoutes.getAll, params: filters },
   { refetchOnFocus: true }
  );

  const createCategory = async (payload: { categoryname: string }) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.create,
        data: payload,
      }).unwrap();

      if (res?.success) {
        refetchCategory();
       toast.success(payload.categoryname ? `Category ${payload.categoryname} created successfully!`: "Category created successfully!");
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create category."));
      return { success: false, error };
    }
  };

  const updateCategory = async (id: string | number, categoryname: string) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.update(id),
        method: "PUT",
        data: { categoryname },
      }).unwrap();

      if (res?.success) {
        refetchCategory();
        toast.success(`Category ${categoryname} updated successfully!`);
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update category."));
      return { success: false, error };
    }
  };

  const deleteCategory = async (id: string | number , categoryname: string,) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.delete(id),
        method: "DELETE",
      }).unwrap();

      if (res?.success) {
        refetchCategory();
        toast.success(`Category ${categoryname} removed successfully!`);
      }
      setDeleteConfirm(null);
      return { success: true };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete category."));
      return { success: false, error };
    }
  };

  const createSubCategory = async (
    id: string | number,
    subCategoryName: string,
  ) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.addSubCategory(id),
        method: "PUT",
        data: { subCategoryName },
      }).unwrap();

      if (res?.success) {
        refetchCategory();
        toast.success(`Sub-Category ${subCategoryName} created successfully!`);
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to add sub-category."));
      return { success: false, error };
    }
  };

  const updateSubCategory = async (
    id: string | number,
    oldSubCategoryName: string,
    newSubCategoryName: string,
  ) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.updateSubCategory(id),
        method: "PUT",
        data: { oldSubCategoryName, newSubCategoryName },
      }).unwrap();

      if (res?.success) {
        refetchCategory();
        toast.success(
          `Sub-Category ${newSubCategoryName} updated successfully!`,
        );
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update sub-category."));
      return { success: false, error };
    }
  };

  const deleteSubCategory = async (
    id: string | number,
    subCategoryName: string,
  ) => {
    try {
      const res = await crudCategory({
        endpoint: endpoints.categoryRoutes.removeSubCategory(id),
        method: "PUT",
        data: { subCategoryName },
      }).unwrap();

      if (res?.success) {
        refetchCategory();
        toast.success(`Sub-Category ${subCategoryName} removed successfully!`);
      }
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to remove sub-category."));
      return { success: false, error };
    }
  };

  return {
    categories: responseData?.data || [],
    pagination: responseData?.pagination || {
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 5,
      isAllRecord: true
    },
    deleteConfirm,
    setDeleteConfirm,
    isFetchingCategories,
    isMutating,
    refetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
  };
};
