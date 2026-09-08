import { Badge, Button, Text } from "@milindvpatil05-dev/react-native-fieldops-ui";
import axios from "axios";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { STATUS_LABEL, STATUS_OPTIONS, toBadgeStatus } from "../constants/workOrderStatus";
import { useUpdateWorkOrderStatus, useWorkOrder } from "../hooks/useWorkOrder";

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

export default function WorkOrderDetailsScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: workOrder, isLoading, isError, error, refetch } = useWorkOrder(id);
  const updateStatus = useUpdateWorkOrderStatus(id);

  // Loading the record for the first time.
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text variant="body" color="fg-muted">
          Loading work order…
        </Text>
      </View>
    );
  }

  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  if (isNotFound) {
    return (
      <View style={styles.centered}>
        <Text variant="heading">Work order not found</Text>
        <Text variant="body" color="fg-muted">
          It may have been deleted, or the link is wrong.
        </Text>
        <Button label="Back to list" variant="primary" onPress={() => router.back()} />
      </View>
    );
  }

  if (isError || !workOrder) {
    return (
      <View style={styles.centered}>
        <Text variant="heading" color="danger">
          ⚠ Something went wrong
        </Text>
        <Text variant="body" color="danger">
          Error loading this work order.
        </Text>
        <Button label="Retry" variant="primary" onPress={() => refetch()} />
      </View>
    );
  }

  // The status attempted in the mutation currently shown as failed, if any.
  const failedStatus = updateStatus.isError ? updateStatus.variables : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Button label="←" variant="ghost" size="sm" onPress={() => router.back()} style={styles.back} />
        <Text variant="title">{workOrder.reference}</Text>
      </View>
      <Text variant="heading" style={styles.title}>
        {workOrder.title}
      </Text>
      <View style={styles.metaRow}>
        <Badge status={toBadgeStatus(workOrder.status)} label={STATUS_LABEL[workOrder.status]} />
        <Text variant="label" color="fg-muted">
          Priority: {capitalize(workOrder.priority)}
        </Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="Site" value={workOrder.site} />
        <InfoRow label="Assignee" value={workOrder.assignee?.name ?? "Unassigned"} />
        <InfoRow label="Due" value={workOrder.dueAt} />
      </View>

      <View style={styles.section}>
        <Text variant="label" color="fg-muted" style={styles.sectionLabel}>
          Description
        </Text>
        <Text variant="body">{workOrder.description}</Text>
      </View>

      <View style={styles.section}>
        <Text variant="label" color="fg-muted" style={styles.sectionLabel}>
          Checklist
        </Text>
        {workOrder.checklist.map((item) => (
          <Text key={item.id} variant="body" style={styles.checklistItem}>
            {item.done ? "☑" : "☐"} {item.label}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="label" color="fg-muted" style={styles.sectionLabel}>
          Status
        </Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.key}
              label={option.label}
              size="sm"
              variant={workOrder.status === option.key ? "primary" : "secondary"}
              disabled={updateStatus.isPending}
              onPress={() => updateStatus.mutate(option.key)}
            />
          ))}
        </View>

        {updateStatus.isError && failedStatus && (
          <View style={styles.statusError}>
            <Text variant="caption" color="danger">
              Couldn't set status to "{STATUS_LABEL[failedStatus]}". Reverted to "
              {STATUS_LABEL[workOrder.status]}".
            </Text>
            <Button
              label="Retry"
              size="sm"
              variant="destructive"
              onPress={() => updateStatus.mutate(failedStatus)}
            />
          </View>
        )}
      </View>

      <Button label="Edit" variant="secondary" onPress={() => {}} style={styles.edit} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="label" color="fg-muted" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = {
  container: { padding: 16, gap: 4, paddingBottom: 48 },
  centered: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    padding: 24,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  back: { paddingHorizontal: 4 },
  title: { marginBottom: 8 },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 16,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 16,
    gap: 8,
  },
  sectionLabel: { marginBottom: 4 },
  infoRow: { flexDirection: "row" as const, gap: 8 },
  infoLabel: { width: 90 },
  checklistItem: { paddingVertical: 2 },
  statusRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  statusError: {
    marginTop: 8,
    gap: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  edit: { marginTop: 24 },
};
