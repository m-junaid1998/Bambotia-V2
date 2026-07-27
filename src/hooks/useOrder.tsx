import { useCrudMutation, useGetsQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/types";

export interface OrderFilters {
  page?: number;
  search?: string;
  status?: string;
  dateRange?: string;
  isAllRecord?: boolean;
}

export const useOrder = (filters?: OrderFilters) => {
  const {
    data: responseData,
    isLoading: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useGetsQuery(
    { endpoint: endpoints.orderRoutes.dashboardOrders, params: filters },
    { skip: !filters, refetchOnFocus: true },
  );

  const {
    data: myOrdersData,
    isLoading: isFetchingMyOrders,
    refetch: refetchMyOrders,
  } = useGetsQuery(endpoints.orderRoutes.myOrders, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const [executeCrud, { isLoading: isMutating }] = useCrudMutation();

  const createOrder = async (orderPayload: Record<string, unknown>) => {
    try {
      const res = await executeCrud({
        endpoint: endpoints.orderRoutes.create,
        data: orderPayload,
      }).unwrap();

      toast.success("Order placed successfully!");
      refetchMyOrders();
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to place order."));
      return { success: false, error };
    }
  };

  const getOrderById = async (id: string | number) => {
    try {
      const res = await executeCrud({
        endpoint: endpoints.orderRoutes.getById(id),
        method: "GET",
      }).unwrap();
      return { success: true, data: res.data };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch order details."));
      return { success: false, error };
    }
  };

  const updateOrderStatus = async (
    id: string | number,
    status: string,
    adminNotes?: string,
  ) => {
    try {
      await executeCrud({
        endpoint: endpoints.orderRoutes.updateStatus(id),
        method: "PATCH",
        data: { status, adminNotes },
      }).unwrap();
      if (refetchDashboard) refetchDashboard();
      return { success: true };
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update order status."));
      return { success: false, error };
    }
  };

  return {
    orders: responseData?.data || [],
    myOrders: myOrdersData?.data || [],
    pagination: responseData?.pagination || { totalCount: 0, totalPages: 1 },
    stats: {
      total: responseData?.stats?.totalOrders || 0,
      pending: responseData?.stats?.pendingOrders || 0,
      confirmed: responseData?.stats?.confirmedOrders || 0,
      processing: responseData?.stats?.processingOrders || 0,
      shipped: responseData?.stats?.shippedOrders || 0,
      delivered: responseData?.stats?.deliveredOrders || 0,
      cancelled: responseData?.stats?.cancelledOrders || 0,
      revenue: responseData?.stats?.totalRevenue || 0,
    },
    isFetching: isFetchingDashboard,
    isFetchingMyOrders,
    isUpdatingStatus: isMutating,
    isCreatingOrder: isMutating,
    createOrder,
    refetchDashboard,
    getOrderById,
    updateOrderStatus,
  };
};
