import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Select,
  Text,
  TextField,
} from "@milindvpatil05-dev/react-native-fieldops-ui";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "../components/nav-bar";
import { PRIORITY_FORM_OPTIONS, toAssigneeOptions } from "../constants/workOrderForm";
import { WorkOrderPriority } from "../enums/workOrder";
import { useUsers } from "../hooks/useUsers";
import { useCreateWorkOrder, useUpdateWorkOrder } from "../hooks/useSaveWorkOrder";
import { useWorkOrder } from "../hooks/useWorkOrder";
import {
  MAX_CHECKLIST_ITEMS,
  emptyWorkOrderFormValues,
  workOrderDetailToFormInput,
  workOrderFormSchema,
  type WorkOrderFormInput,
  type WorkOrderFormValues,
} from "../schemas/workOrderForm";
import { styles } from "../styles/createWorkOrder.styles";
import type { WorkOrderDetail } from "../types/workOrder";
import type { CreateWorkOrderScreenProps } from "../types/workOrderScreen";

// TextField's public props don't declare native multiline support, but the underlying
// TextInput accepts it — this bag is spread in as an escape hatch instead of forking the component.
const MULTILINE_TEXT_INPUT_PROPS: Record<string, unknown> = {
  multiline: true,
  numberOfLines: 5,
  textStyle: { minHeight: 96, textAlignVertical: "top" },
};

// Fields the form actually renders; anything else in a 422 payload is surfaced as a form-level error.
const KNOWN_FIELDS = new Set(["title", "site", "priority", "assigneeId", "dueAt", "description", "checklist"]);

export default function CreateWorkOrderScreen({ mode, id }: CreateWorkOrderScreenProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    data: existing,
    isLoading: isLoadingExisting,
    isError: isExistingError,
    refetch: refetchExisting,
  } = useWorkOrder(isEdit ? (id ?? "") : "");

  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const createMutation = useCreateWorkOrder();
  const updateMutation = useUpdateWorkOrder(id ?? "");
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [formError, setFormError] = useState<string | null>(null);
  // Set only on a 409: the server's current record, shown so the user can decide how to proceed
  // without losing what they've typed.
  const [conflict, setConflict] = useState<WorkOrderDetail | null>(null);
  const [version, setVersion] = useState<number | undefined>(undefined);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<WorkOrderFormInput, unknown, WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: emptyWorkOrderFormValues,
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "checklist" });

  // Prefill once the existing record loads; later background refetches must not clobber edits in progress.
  const initialized = useRef(false);
  useEffect(() => {
    if (isEdit && existing && !initialized.current) {
      reset(workOrderDetailToFormInput(existing));
      setVersion(existing.version);
      initialized.current = true;
    }
  }, [isEdit, existing, reset]);

  function applyServerErrors(serverErrors: Record<string, string>) {
    const unknownMessages: string[] = [];
    Object.entries(serverErrors).forEach(([field, message]) => {
      if (KNOWN_FIELDS.has(field)) {
        setError(field as keyof WorkOrderFormInput, { type: "server", message });
      } else {
        unknownMessages.push(message);
      }
    });
    if (unknownMessages.length) setFormError(unknownMessages.join(" "));
  }

  function handleSaveError(err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409) {
        const current = (err.response.data as { current?: WorkOrderDetail } | undefined)?.current;
        if (current) {
          setConflict(current);
          return;
        }
      }
      if (err.response?.status === 422) {
        const serverErrors =
          (err.response.data as { errors?: Record<string, string> } | undefined)?.errors ?? {};
        applyServerErrors(serverErrors);
        return;
      }
    }
    setFormError("Something went wrong saving this work order. Please try again.");
  }

  function toWritePayload(values: WorkOrderFormValues) {
    return {
      title: values.title,
      site: values.site,
      priority: values.priority,
      assigneeId: values.assigneeId,
      dueAt: new Date(values.dueAt).toISOString(),
      description: values.description,
      checklist: values.checklist.map((item) => ({
        id: item.id,
        label: item.label,
        done: item.done ?? false,
      })),
    };
  }

  async function submit(values: WorkOrderFormValues, versionOverride?: number) {
    setFormError(null);
    const payload = toWritePayload(values);
    try {
      if (isEdit) {
        const targetVersion = versionOverride ?? version;
        if (targetVersion === undefined) return;
        const updated = await updateMutation.mutateAsync({ ...payload, version: targetVersion });
        setVersion(updated.version);
        setConflict(null);
        router.back();
      } else {
        const created = await createMutation.mutateAsync(payload);
        router.replace({ pathname: "/work-orders/[id]", params: { id: created.id } });
      }
    } catch (err) {
      handleSaveError(err);
    }
  }

  const onValid = (values: WorkOrderFormValues) => {
    if (isSaving) return; // guard against duplicate submissions
    submit(values);
  };

  // "Keep mine": resend the user's current field values against the server's newer version.
  function retryWithMyChanges() {
    if (!conflict) return;
    const values = workOrderFormSchema.parse(getValues());
    submit(values, conflict.version);
  }

  // "Load latest": discard in-flight edits in favour of the server's current state.
  function loadLatestVersion() {
    if (!conflict) return;
    reset(workOrderDetailToFormInput(conflict));
    setVersion(conflict.version);
    setConflict(null);
  }

  if (isEdit && isLoadingExisting) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Edit work order" onBack={() => router.back()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text variant="body" color="fg-muted">
            Loading work order…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEdit && (isExistingError || !existing)) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Edit work order" onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text variant="heading" color="danger">
            ⚠ Something went wrong
          </Text>
          <Text variant="body" color="danger">
            Error loading this work order.
          </Text>
          <Button label="Retry" variant="primary" onPress={() => refetchExisting()} />
        </View>
      </SafeAreaView>
    );
  }

  const assigneeOptions = toAssigneeOptions(users ?? []);

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={isEdit ? "Edit work order" : "New work order"} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                label="Title"
                placeholder="e.g. Compressor A3 — overheating under load"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                helperTextColor={errors.title ? "danger" : undefined}
              />
            )}
          />

          <Controller
            control={control}
            name="site"
            render={({ field }) => (
              <TextField
                label="Site"
                placeholder="e.g. Pier 4 Cold Store"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.site)}
                helperText={errors.site?.message}
                helperTextColor={errors.site ? "danger" : undefined}
              />
            )}
          />

          <View style={styles.field}>
            <Text variant="label">Priority</Text>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  options={PRIORITY_FORM_OPTIONS}
                  value={field.value}
                  onChange={(value) => field.onChange(value as WorkOrderPriority)}
                  placeholder="Select priority"
                  error={Boolean(errors.priority)}
                />
              )}
            />
            {errors.priority && (
              <Text variant="caption" color="danger">
                {errors.priority.message}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text variant="label">Assignee</Text>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => (
                <Select
                  options={assigneeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={isLoadingUsers ? "Loading…" : "Unassigned"}
                  error={Boolean(errors.assigneeId)}
                />
              )}
            />
            {errors.assigneeId && (
              <Text variant="caption" color="danger">
                {errors.assigneeId.message}
              </Text>
            )}
          </View>

          <Controller
            control={control}
            name="dueAt"
            render={({ field }) => (
              <TextField
                label="Due date"
                placeholder="ISO date, e.g. 2026-09-10T09:00:00.000Z"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.dueAt)}
                helperText={errors.dueAt?.message ?? "ISO 8601 format."}
                helperTextColor={errors.dueAt ? "danger" : "fg-muted"}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                label="Description"
                placeholder="What's happening, and what's been tried so far?"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                helperTextColor={errors.description ? "danger" : undefined}
                {...MULTILINE_TEXT_INPUT_PROPS}
              />
            )}
          />

          <View style={styles.field}>
            <View style={styles.sectionHeader}>
              <Text variant="label">Checklist</Text>
              <Button
                label="+ Add item"
                size="sm"
                variant="ghost"
                disabled={fields.length >= MAX_CHECKLIST_ITEMS}
                onPress={() => append({ label: "", done: false })}
              />
            </View>
            {errors.checklist?.message && (
              <Text variant="caption" color="danger">
                {errors.checklist.message}
              </Text>
            )}
            <Text variant="caption" color="fg-muted" style={styles.checklistHint}>
              {fields.length}/{MAX_CHECKLIST_ITEMS} items
            </Text>

            {fields.map((item, index) => (
              <View key={item.id} style={styles.checklistRow}>
                <Controller
                  control={control}
                  name={`checklist.${index}.label` as const}
                  render={({ field }) => (
                    <TextField
                      placeholder={`Item ${index + 1}`}
                      value={field.value}
                      onChange={field.onChange}
                      error={Boolean(errors.checklist?.[index]?.label)}
                      helperText={errors.checklist?.[index]?.label?.message}
                      helperTextColor="danger"
                      style={styles.checklistInput}
                    />
                  )}
                />
                <View style={styles.checklistActions}>
                  <Button
                    label="↑"
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                    onPress={() => move(index, index - 1)}
                  />
                  <Button
                    label="↓"
                    size="sm"
                    variant="ghost"
                    disabled={index === fields.length - 1}
                    onPress={() => move(index, index + 1)}
                  />
                  <Button label="Remove" size="sm" variant="destructive" onPress={() => remove(index)} />
                </View>
              </View>
            ))}
          </View>

          {conflict && (
            <View style={styles.conflictBanner}>
              <Text variant="label" color="danger">
                This work order was changed by someone else
              </Text>
              <Text variant="body">
                The latest version is "{conflict.title}" — status {conflict.status}, priority{" "}
                {conflict.priority}, due {conflict.dueAt}. Your edits below have not been lost.
              </Text>
              <View style={styles.conflictActions}>
                <Button label="Keep my changes & retry" size="sm" variant="primary" onPress={retryWithMyChanges} />
                <Button label="Load latest version" size="sm" variant="secondary" onPress={loadLatestVersion} />
              </View>
            </View>
          )}

          {formError && (
            <View style={styles.formError}>
              <Text variant="body" color="danger">
                {formError}
              </Text>
            </View>
          )}

          <Button
            label={isEdit ? "Save changes" : "Create work order"}
            variant="primary"
            disabled={isSaving || isSubmitting}
            loading={isSaving || isSubmitting}
            onPress={handleSubmit(onValid)}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
