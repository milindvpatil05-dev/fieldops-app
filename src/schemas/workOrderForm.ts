import { z } from "zod";
import { WorkOrderPriority } from "../enums/workOrder";

// Sentinel used by the Select (which only deals in strings) to mean "no assignee".
export const UNASSIGNED_VALUE = "";

export const MAX_CHECKLIST_ITEMS = 10;

const DAY_MS = 86400000;

export const checklistItemFormSchema = z.object({
  // Present for existing items (round-tripped to the server); absent for newly added rows.
  id: z.string().optional(),
  label: z.string().trim().min(1, "Checklist items can't be empty."),
  // Not user-editable here, but round-tripped so saving the form never un-completes existing items.
  done: z.boolean().optional(),
});

// Mirrors the server rules in src/mock-api/README.md, including the urgent/48h cross-field rule.
export const workOrderFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(8, "Title must be at least 8 characters.")
      .max(120, "Title must be 120 characters or fewer."),
    site: z.string().trim().min(1, "Site is required."),
    priority: z.enum(WorkOrderPriority),
    assigneeId: z.string(),
    dueAt: z
      .string()
      .trim()
      .min(1, "A valid due date is required.")
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: "A valid due date is required.",
      }),
    description: z.string().max(2000, "Description is too long."),
    checklist: z
      .array(checklistItemFormSchema)
      .max(MAX_CHECKLIST_ITEMS, `Maximum of ${MAX_CHECKLIST_ITEMS} checklist items.`),
  })
  .transform((values) => ({
    ...values,
    assigneeId: values.assigneeId ? values.assigneeId : null,
  }))
  .refine(
    (values) => {
      if (values.priority !== WorkOrderPriority.Urgent) return true;
      const due = Date.parse(values.dueAt);
      if (Number.isNaN(due)) return true; // caught by the dueAt field rule above
      return due - Date.now() <= 2 * DAY_MS;
    },
    {
      message: "Urgent work orders must be due within 48 hours.",
      path: ["dueAt"],
    },
  );

// Shape the form fields hold while editing (pre-transform: assigneeId is always a string).
export type WorkOrderFormInput = z.input<typeof workOrderFormSchema>;
// Shape handed to onSubmit (post-transform: assigneeId is string | null).
export type WorkOrderFormValues = z.output<typeof workOrderFormSchema>;

export const emptyWorkOrderFormValues: WorkOrderFormInput = {
  title: "",
  site: "",
  priority: WorkOrderPriority.Medium,
  assigneeId: UNASSIGNED_VALUE,
  dueAt: "",
  description: "",
  checklist: [],
};

export function workOrderDetailToFormInput(detail: {
  title: string;
  site: string;
  priority: WorkOrderPriority;
  assignee?: { id: string } | null;
  dueAt: string;
  description: string;
  checklist: { id: string; label: string; done: boolean }[];
}): WorkOrderFormInput {
  return {
    title: detail.title,
    site: detail.site,
    priority: detail.priority,
    assigneeId: detail.assignee?.id ?? UNASSIGNED_VALUE,
    dueAt: detail.dueAt,
    description: detail.description,
    checklist: detail.checklist.map((item) => ({
      id: item.id,
      label: item.label,
      done: item.done,
    })),
  };
}
