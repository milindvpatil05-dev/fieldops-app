import { STATUS_OPTIONS } from "./workOrderStatus";
import { ALL_FILTER_VALUE } from "./workOrder";
import { PRIORITY_FORM_OPTIONS } from "./workOrderForm";
import type {
  WorkOrderPriorityFilter,
  WorkOrderStatusFilter,
} from "../types/workOrderFilters";

export const STATUS_FILTERS: {
  key: WorkOrderStatusFilter;
  label: string;
}[] = [{ key: ALL_FILTER_VALUE, label: "All" }, ...STATUS_OPTIONS];

export const PRIORITY_OPTIONS: {
  label: string;
  value: WorkOrderPriorityFilter;
}[] = [
  { label: "Any priority", value: ALL_FILTER_VALUE },
  ...PRIORITY_FORM_OPTIONS,
];
