import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { WORK_ORDER_PAGE_SIZE } from "../constants/workOrder";
import type { WorkOrdersFilters, WorkOrdersPage } from "../types/workOrder";

export function useWorkOrders(filters: WorkOrdersFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["workOrders", filters],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<WorkOrdersPage>("/work-orders", {
        params: {
          limit: WORK_ORDER_PAGE_SIZE,
          cursor: pageParam,
          status: filters.status,
          priority: filters.priority,
          assigneeId: filters.assigneeId,
          // Omit blank search so an empty query doesn't filter out everything server-side.
          q: filters.q || undefined,
        },
      });
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

