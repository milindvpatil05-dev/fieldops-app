import type { WorkOrderPriority, WorkOrderStatus } from "../enums/workOrder";

export type WorkOrderStatusFilter = WorkOrderStatus | "all";
export type WorkOrderPriorityFilter = WorkOrderPriority | "all";
