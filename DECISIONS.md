# Decisions

## Data Loading

- Work order details are always fetched via `GET /work-orders/:id`, keyed by the `id` route param.
- The list endpoint (`GET /work-orders`) only returns summaries, so a second fetch is required for full detail.
- This keeps route params serializable and supports deep links or refreshes.
- React Query caches detail queries under `["workOrder", id]` for instant revisits.

## Status Updates

- Status changes are applied optimistically in `onMutate` across both detail and list caches.
- On error, caches are rolled back to pre‑mutation snapshots to avoid inconsistent UI.
- Retry is manual (button), not automatic, since PATCH is idempotent but failures should be visible to the user.

## Create / Edit Work Orders

- One screen handles both modes: `CreateWorkOrderScreen` with `mode: "create" | "edit"`.
- Edit mode loads data via `useWorkOrder(id)` and pre‑fills once; background refetches never overwrite in‑progress edits.
- Server errors (422) map directly to RHF fields; unknown keys show as a banner.
- Conflicts (409) never discard input. User chooses to retry with their changes or load the latest server version.
- Checklist `done` flags are preserved in hidden state so edits don’t reset completion.
- Description field uses prop spreading (`multiline`, `numberOfLines`) to bypass TypeScript excess‑property checks without casting.
- Keyboard handling uses `KeyboardAvoidingView` and `ScrollView` insets — no extra dependencies, works in Expo Go.
