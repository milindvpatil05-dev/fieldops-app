import { WorkOrderPriority } from "../enums/workOrder";
import type { WorkOrderUser } from "../types/workOrder";
import { UNASSIGNED_VALUE } from "../schemas/workOrderForm";

export const PRIORITY_FORM_OPTIONS: { label: string; value: WorkOrderPriority }[] = [
  { label: "Low", value: WorkOrderPriority.Low },
  { label: "Medium", value: WorkOrderPriority.Medium },
  { label: "High", value: WorkOrderPriority.High },
  { label: "Urgent", value: WorkOrderPriority.Urgent },
];

export function toAssigneeOptions(users: WorkOrderUser[]) {
  return [
    { label: "Unassigned", value: UNASSIGNED_VALUE },
    ...users.map((user) => ({ label: user.name, value: user.id })),
  ];
}
