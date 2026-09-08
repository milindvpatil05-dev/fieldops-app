import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { WorkOrderDetail, WorkOrderPriority } from "../types/workOrder";

export interface WorkOrderWritePayload {
  title: string;
  site: string;
  priority: WorkOrderPriority;
  assigneeId: string | null;
  dueAt: string;
  description: string;
  checklist: { id?: string; label: string; done?: boolean }[];
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WorkOrderWritePayload) => {
      const res = await api.post<{ data: WorkOrderDetail }>("/work-orders", payload);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(["workOrder", created.id], created);
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

export function useUpdateWorkOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // The caller must include the version of the record it originally loaded;
    // a stale version is what triggers the server's 409 conflict response.
    mutationFn: async (payload: WorkOrderWritePayload & { version: number }) => {
      const res = await api.patch<{ data: WorkOrderDetail }>(`/work-orders/${id}`, payload);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["workOrder", id], updated);
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}
