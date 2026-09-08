import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { WorkOrdersFilters, WorkOrdersPage } from "../types/workOrder";

const PAGE_SIZE = 10;

export function useWorkOrders(filters: WorkOrdersFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["workOrders", filters],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<WorkOrdersPage>("/work-orders", {
        params: {
          limit: PAGE_SIZE,
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

