import type { WorkOrderPriority, WorkOrderStatus } from "../enums/workOrder";

export type { WorkOrderPriority, WorkOrderStatus } from "../enums/workOrder";

export interface WorkOrderAssignee {
  id: string;
  name: string;
}

// GET /users — full user record used to populate the assignee picker.
export interface WorkOrderUser {
  id: string;
  name: string;
  role: "technician" | "supervisor";
}

export interface WorkOrder {
  id: string;
  reference: string;
  title: string;
  site: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  dueAt: string;
  assignee?: WorkOrderAssignee;
}

// Envelope returned by GET /work-orders; nextCursor is null once there are no more pages.
export interface WorkOrdersPage {
  data: WorkOrder[];
  nextCursor: string | null;
}

export interface WorkOrdersFilters {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  assigneeId?: string;
  q?: string;
}

export interface WorkOrderChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

// Full record returned by GET /work-orders/:id; the list summary omits these fields.
export interface WorkOrderDetail extends WorkOrder {
  description: string;
  checklist: WorkOrderChecklistItem[];
  // Optimistic-concurrency token; must be sent back on every status PATCH.
  version: number;
}
