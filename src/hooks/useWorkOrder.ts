import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import axios from "axios";
import { api } from "../api/client";
import type {
  WorkOrderDetail,
  WorkOrderStatus,
  WorkOrdersPage,
} from "../types/workOrder";

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      // The API wraps every payload as { data: ... }.
      const res = await api.get<{ data: WorkOrderDetail }>(
        `/work-orders/${id}`,
      );
      return res.data.data;
    },
    enabled: Boolean(id),
    // A 404 means the record doesn't exist; retrying the request won't change that.
    retry: (failureCount, error) =>
      !(axios.isAxiosError(error) && error.response?.status === 404) &&
      failureCount < 2,
  });
}

type StatusMutationContext = {
  previousDetail?: WorkOrderDetail;
  previousLists: Array<
    [readonly unknown[], InfiniteData<WorkOrdersPage> | undefined]
  >;
};

export function useUpdateWorkOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation<
    WorkOrderDetail,
    unknown,
    WorkOrderStatus,
    StatusMutationContext
  >({
    mutationFn: async (status) => {
      // The API uses optimistic concurrency: it rejects the write unless `version` matches its current record.
      const current = queryClient.getQueryData<WorkOrderDetail>([
        "workOrder",
        id,
      ]);
      const res = await api.patch<{ data: WorkOrderDetail }>(
        `/work-orders/${id}`,
        {
          status,
          version: current?.version,
        },
      );
      return res.data.data;
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ["workOrder", id] });
      await queryClient.cancelQueries({ queryKey: ["workOrders"] });

      const previousDetail = queryClient.getQueryData<WorkOrderDetail>([
        "workOrder",
        id,
      ]);
      const previousLists = queryClient.getQueriesData<
        InfiniteData<WorkOrdersPage>
      >({ queryKey: ["workOrders"] });

      // Optimistic: reflect the new status immediately, everywhere it appears.
      queryClient.setQueryData<WorkOrderDetail>(["workOrder", id], (old) =>
        old ? { ...old, status } : old,
      );
      queryClient.setQueriesData<InfiniteData<WorkOrdersPage>>(
        { queryKey: ["workOrders"] },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((wo) =>
                wo.id === id ? { ...wo, status } : wo,
              ),
            })),
          },
      );

      return { previousDetail, previousLists };
    },
    // Restore the exact pre-mutation snapshots so the detail and list never disagree after a failed write.
    onError: (_err, _status, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(["workOrder", id], context.previousDetail);
      }
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrder", id] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}
