import {
    Badge,
    Button,
    Select,
    Text,
    TextField,
} from "@milindvpatil05-dev/react-native-fieldops-ui";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "../components/nav-bar";
import { STATUS_OPTIONS, toBadgeStatus } from "../constants/workOrderStatus";
import { useWorkOrders } from "../hooks/useWorkOrders";
import type { WorkOrderPriority, WorkOrderStatus } from "../types/workOrder";

const STATUS_FILTERS: { key: WorkOrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...STATUS_OPTIONS,
];

const PRIORITY_OPTIONS: { label: string; value: WorkOrderPriority | "all" }[] =
  [
    { label: "Any priority", value: "all" },
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
  ];

const SEARCH_DEBOUNCE_MS = 400;

export default function WorkOrdersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    WorkOrderPriority | "all"
  >("all");

  // Avoid firing a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(handle);
  }, [search]);

  const filters = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
      q: debouncedSearch.trim() || undefined,
    }),
    [statusFilter, priorityFilter, debouncedSearch],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useWorkOrders(filters);

  const workOrders = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    debouncedSearch.trim() !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearch("");
    setDebouncedSearch("");
  };

  // First load only: no cached data to show yet.
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Work orders" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text variant="body" color="fg-muted">
            Loading work orders…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // A separate branch from the empty states below: the request itself failed.
  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title="Work orders" />
        <View style={styles.centered}>
          <Text variant="heading" color="danger">
            ⚠ Something went wrong
          </Text>
          <Text variant="body" color="danger">
            Error loading work orders.
          </Text>
          <Button label="Retry" variant="primary" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  // True only for pull-to-refresh / filter changes, not the initial load or pagination.
  const isRefreshing = isFetching && !isFetchingNextPage;

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title="Work orders" />
      <View style={styles.container}>
        <TextField
          placeholder="🔍  Search"
          value={search}
          onChange={setSearch}
          style={styles.search}
        />

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.key}
                label={filter.label}
                size="sm"
                variant={statusFilter === filter.key ? "primary" : "ghost"}
                onPress={() => setStatusFilter(filter.key)}
              />
            ))}
          </ScrollView>
          <Select
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={(value) =>
              setPriorityFilter(value as WorkOrderPriority | "all")
            }
            placeholder="Priority"
          />
        </View>

        <FlatList
          data={workOrders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
          }
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListEmptyComponent={
            hasActiveFilters ? (
              <View style={styles.empty}>
                <Text variant="body" color="fg-muted">
                  No work orders match these filters.
                </Text>
                <Button
                  label="Clear filters"
                  variant="ghost"
                  onPress={clearFilters}
                />
              </View>
            ) : (
              <View style={styles.empty}>
                <Text variant="body" color="fg-muted">
                  No work orders yet.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: "/work-orders/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.rowHeader}>
                <Text variant="label">{item.reference}</Text>
                <Badge status={toBadgeStatus(item.status)} />
              </View>
              <Text variant="body">{item.title}</Text>
              <Text variant="caption" color="fg-muted">
                {item.site}
              </Text>
              <Text variant="caption" color="fg-muted">
                Due {item.dueAt} · {item.assignee?.name ?? "Unassigned"}
              </Text>
            </Pressable>
          )}
          // Footer only; appended below existing rows so loading more never shifts the list.
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} />
            ) : null
          }
        />

        <Button
          label="+"
          variant="primary"
          onPress={() => {}}
          style={styles.fab}
          textStyle={styles.fabLabel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = {
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    padding: 24,
  },
  search: { marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  filterRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  chipRow: { gap: 8, paddingRight: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 96, flexGrow: 1 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 4,
  },
  rowHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  empty: { alignItems: "center" as const, gap: 8, padding: 24 },
  footer: { paddingVertical: 16 },
  fab: {
    position: "absolute" as const,
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  fabLabel: { fontSize: 24, lineHeight: 28 },
};
