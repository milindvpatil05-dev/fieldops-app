export interface WorkOrderDetailsScreenProps {
  id: string;
}

export interface InfoRowProps {
  label: string;
  value: string;
}

export type CreateWorkOrderMode = "create" | "edit";

export interface CreateWorkOrderScreenProps {
  mode: CreateWorkOrderMode;
  // Required when mode is "edit"; ignored otherwise.
  id?: string;
}
