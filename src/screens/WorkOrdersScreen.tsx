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
import { SEARCH_DEBOUNCE_MS } from "../constants/workOrder";
import { PRIORITY_OPTIONS, STATUS_FILTERS } from "../constants/workOrderFilters";
import { toBadgeStatus } from "../constants/workOrderStatus";
import { useWorkOrders } from "../hooks/useWorkOrders";
import { styles } from "../styles/workOrders.styles";
import type {
  WorkOrderPriorityFilter,
  WorkOrderStatusFilter,
} from "../types/workOrderFilters";

export default function WorkOrdersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatusFilter>(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriorityFilter>("all");

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
              setPriorityFilter(value as WorkOrderPriorityFilter)
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

