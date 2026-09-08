import { Badge, Button, Text } from "@milindvpatil05-dev/react-native-fieldops-ui";
import axios from "axios";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "../components/nav-bar";
import { STATUS_LABEL, STATUS_OPTIONS, toBadgeStatus } from "../constants/workOrderStatus";
import { useUpdateWorkOrderStatus, useWorkOrder } from "../hooks/useWorkOrder";
import { styles } from "../styles/workOrderDetails.styles";
import type { WorkOrderDetailsScreenProps, InfoRowProps } from "../types/workOrderScreen";

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

export default function WorkOrderDetailsScreen({ id }: WorkOrderDetailsScreenProps) {
  const router = useRouter();
  const { data: workOrder, isLoading, isError, error, refetch } = useWorkOrder(id);
  const updateStatus = useUpdateWorkOrderStatus(id);

  // Loading the record for the first time.
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Work order" onBack={() => router.back()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text variant="body" color="fg-muted">
            Loading work order…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  if (isNotFound) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Work order" onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text variant="heading">Work order not found</Text>
          <Text variant="body" color="fg-muted">
            It may have been deleted, or the link is wrong.
          </Text>
          <Button label="Back to list" variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !workOrder) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Work order" onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text variant="heading" color="danger">
            ⚠ Something went wrong
          </Text>
          <Text variant="body" color="danger">
            Error loading this work order.
          </Text>
          <Button label="Retry" variant="primary" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  // The status attempted in the mutation currently shown as failed, if any.
  const failedStatus = updateStatus.isError ? updateStatus.variables : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={workOrder.reference} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
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
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text variant="label" color="fg-muted" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}
