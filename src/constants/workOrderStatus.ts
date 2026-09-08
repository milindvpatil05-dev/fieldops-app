import type { WorkOrderStatus } from "../types/workOrder";

export const STATUS_OPTIONS: { key: WorkOrderStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export const STATUS_LABEL = STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.key]: option.label }),
  {} as Record<WorkOrderStatus, string>
);

// The Badge component only knows the hyphenated form; the API uses snake_case.
export function toBadgeStatus(status: WorkOrderStatus) {
  return status === "in_progress" ? ("in-progress" as const) : status;
}
