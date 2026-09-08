import { STATUS_OPTIONS } from "./workOrderStatus";
import { WorkOrderPriority } from "../enums/workOrder";
import type {
  WorkOrderPriorityFilter,
  WorkOrderStatusFilter,
} from "../types/workOrderFilters";

export const STATUS_FILTERS: {
  key: WorkOrderStatusFilter;
  label: string;
}[] = [{ key: "all", label: "All" }, ...STATUS_OPTIONS];

export const PRIORITY_OPTIONS: {
  label: string;
  value: WorkOrderPriorityFilter;
}[] = [
  { label: "Any priority", value: "all" },
  { label: "Low", value: WorkOrderPriority.Low },
  { label: "Medium", value: WorkOrderPriority.Medium },
  { label: "High", value: WorkOrderPriority.High },
  { label: "Urgent", value: WorkOrderPriority.Urgent },
];
