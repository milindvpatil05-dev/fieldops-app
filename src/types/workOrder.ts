export type WorkOrderStatus = "open" | "in_progress" | "blocked" | "done";

export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

export interface WorkOrderAssignee {
  id: string;
  name: string;
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
