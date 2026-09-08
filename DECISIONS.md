# Decisions

## Data loading: fetch-by-id vs. passing data from the list screen

**Chosen: fetch via `GET /work-orders/:id`**, keyed off the `id` route param (`src/app/work-orders/[id].tsx`).

- The list endpoint (`GET /work-orders`) returns summaries only — no `description` or `checklist`.
  Passing the tapped row forward would still leave the detail screen without a full record, so a
  second fetch is unavoidable either way.
- Route params stay serializable (just an id). The screen works identically whether the user tapped
  a row or opened `/work-orders/wo_0011` directly (deep link, refresh, browser back/forward).
- React Query caches the detail under `["workOrder", id]`, so revisiting the same work order within a
  session is instant without prop-drilling from the list.

## Status change: rollback and retry

- Status buttons update the cache optimistically in `onMutate` — both the detail query and every cached
  `["workOrders"]` list page containing this id — so the change feels instant.
- `onError` restores the exact pre-mutation snapshots captured in `onMutate` for both caches. This is
  what stops the list the user came from from lying: if the write actually failed, the list row reverts
  to the same value the detail screen reverts to.
- **Retry is offered** as a manual button, not automatic retries. The status PATCH sets an absolute
  value (not a delta), so it's idempotent and safe to resend. Retry is manual rather than automatic so a
  persistently failing write doesn't loop silently or spam the server — the user sees the failure,
  understands the previous status was restored, and decides whether to try again.
