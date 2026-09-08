# Decisions

## Scope and delivery

- The app uses the separately published `@milindvpatil05-dev/react-native-fieldops-ui` package rather than a relative import or copied source. The package ships its Builder Bob output, TypeScript declarations, `prepare` build, NativeWind dependencies, and the five required components.
- I used GitHub Copilot and other AI-assisted coding tools during development. I reviewed and can defend the resulting architecture and behavior.
- I cut authentication, offline persistence, background sync, push notifications, settings/profile screens, dark mode, animations, store publishing, CI, and exhaustive tests because they are explicitly out of scope for this assessment.

## Component library boundary

- The app consumes the published package through the npm dependency in `package.json`. This keeps the component-library boundary real and lets a clean clone install the built consumer package without the library source tree.
- NativeWind styling remains inside the library package. The app consumes component props and semantic variants instead of importing the library's internal tokens or source. This avoids coupling the app to the library build layout at the cost of keeping shared visual decisions expressed through the public component API.

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
