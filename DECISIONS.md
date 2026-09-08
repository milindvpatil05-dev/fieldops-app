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

## Create / edit work order form

- **One screen, two modes.** `CreateWorkOrderScreen` takes `mode: "create" | "edit"` and (in edit mode)
  an `id`; edit mode loads the record via the existing `useWorkOrder(id)` and prefills the form once,
  guarded by a ref so a background refetch never clobbers in-progress edits.
- **422 field mapping.** Server errors are mapped onto RHF fields by name (`title`, `site`, `priority`,
  `assigneeId`, `dueAt`, `description`, `checklist`). Any error key outside that set (there is one
  documented "further rule ... enforced only on the server") is shown as a form-level banner instead of
  being silently dropped.
- **409 conflict never discards input.** On a stale-version PATCH the server's `current` record is kept
  in local state and rendered as a banner; the user's in-progress field values are left untouched. The
  user explicitly chooses "Keep my changes & retry" (resubmits the same field values against the
  server's newer `version`) or "Load latest version" (resets the form to the server's state so the user
  can re-apply their intent). Nothing is overwritten automatically.
- **Checklist `done` is round-tripped but not editable here.** The form only edits labels/order, but the
  PATCH body replaces the whole checklist array, so each item's `done` flag is carried through
  hidden in the field-array state — otherwise saving an edit would silently un-complete every item.
- **`TextField` has no `multiline` prop.** The UI kit's `TextField` forwards unlisted props straight to
  the underlying `TextInput` at runtime but doesn't declare them in `TextFieldProps`. Rather than fork
  the component, the Description field spreads a small `Record<string, unknown>` prop bag
  (`multiline`, `numberOfLines`, `textStyle`) — TypeScript's excess-property check only applies to
  object literals, not to spread variables, so this passes type-checking without an `any` cast.
- **Keyboard handling stays dependency-free.** `KeyboardAvoidingView` (`padding` on iOS, default on
  Android) plus `ScrollView`'s built-in `automaticallyAdjustKeyboardInsets` (iOS) keep the focused field
  — including the checklist rows at the bottom — above the keyboard, per the current Expo guide's
  recommended baseline. `react-native-keyboard-controller` was deliberately not added: it needs a
  development build and isn't available in Expo Go, which this app hasn't opted into.

