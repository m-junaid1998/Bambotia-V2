import { useCrudMutation, useGetsQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";

export interface QueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateRange?: string;
  isAllRecord?: boolean;
}

export const useContact = (filters: QueryFilters) => {
  const [updateStatusMutation, { isLoading: isUpdatingStatus }] =
    useCrudMutation();
  const [deleteQueryMutation, { isLoading: isDeleting }] = useCrudMutation();
  const [createContactMutation, { isLoading: isCreating }] = useCrudMutation();

  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useGetsQuery(
    { endpoint: endpoints.contactRoutes.dashboardQueries, params: filters },
    { refetchOnFocus: true },
  );

  const createContact = async (contactPayload: { name: string; email: string; message: string }) => {
    try {
      const res = await createContactMutation({
        endpoint: endpoints.contactRoutes.submit,
        data: contactPayload,
      }).unwrap();

      toast.success("Contact submitted successfully.");
      refetch();
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create contact."));
      return { success: false, error };
    }
  };

  const updateQueryStatus = async (
    id: string,
    status: string,
    adminNotes: string = "",
  ) => {
    try {
      await updateStatusMutation({
        endpoint: endpoints.contactRoutes.updateStatus(id),
        method: "PATCH",
        data: { status, adminNotes },
      }).unwrap();

      toast.success("Query status updated successfully.");
      refetch();
      return { success: true };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update status."));
      return { success: false, error };
    }
  };

  const deleteContactQuery = async (id: string) => {
    try {
      await deleteQueryMutation({
        endpoint: endpoints.contactRoutes.delete(id),
        method: "DELETE",
      }).unwrap();
      toast.success("Query deleted successfully.");
      refetch();
      return { success: true };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete query."));
      return { success: false, error };
    }
  };

  return {
    queries: responseData?.data || [],
    pagination: responseData?.pagination || { total: 0, pages: 1 },
    stats: {
      total: responseData?.stats?.totalMessages || 0,
      pending: responseData?.stats?.pendingMessages || 0,
      inProgress: responseData?.stats?.inProgressMessages || 0,
      resolved: responseData?.stats?.resolvedMessages || 0,
    },
    isCreating,
    isFetching,
    isUpdatingStatus,
    isDeleting,
    refetch,
    createContact,
    updateQueryStatus,
    deleteContactQuery,
  };
};
