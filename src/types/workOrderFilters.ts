import type { WorkOrderPriority, WorkOrderStatus } from "../enums/workOrder";
import { ALL_FILTER_VALUE } from "../constants/workOrder";

export type WorkOrderStatusFilter = WorkOrderStatus | typeof ALL_FILTER_VALUE;
export type WorkOrderPriorityFilter = WorkOrderPriority | typeof ALL_FILTER_VALUE;
