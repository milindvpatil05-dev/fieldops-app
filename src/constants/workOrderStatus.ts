import { WorkOrderStatus } from "../enums/workOrder";

export const STATUS_OPTIONS: { key: WorkOrderStatus; label: string }[] = [
  { key: WorkOrderStatus.Open, label: "Open" },
  { key: WorkOrderStatus.InProgress, label: "In progress" },
  { key: WorkOrderStatus.Blocked, label: "Blocked" },
  { key: WorkOrderStatus.Done, label: "Done" },
];

export const STATUS_LABEL = STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.key]: option.label }),
  {} as Record<WorkOrderStatus, string>
);

// The Badge component only knows the hyphenated form; the API uses snake_case.
export function toBadgeStatus(status: WorkOrderStatus) {
  return status === WorkOrderStatus.InProgress ? ("in-progress" as const) : status;
}
