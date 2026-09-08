import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { WorkOrderUser } from "../types/workOrder";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get<{ data: WorkOrderUser[] }>("/users");
      return res.data.data;
    },
    // The assignee list barely changes; avoid refetching every time the form mounts.
    staleTime: 5 * 60 * 1000,
  });
}
