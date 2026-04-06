---
name: event-tracking
description: >
  Add event tracking calls to Vue/Nuxt components in the Insights app using the useTrackEvent composable.
  Use this skill whenever a developer asks to "track" a user action or page view, "add analytics", "instrument" a
  component, "fire an event", implement an event from the events catalog, or wire up tracking for anything in
  the Insights frontend — even if they just say "track when the user clicks X" or "add tracking to this page".
---

# Event Tracking — Insights App

## What this skill does

Helps you add the right `trackEvent()` call to the right place in the codebase, using the catalog-approved event definitions.

## Composable location

`frontend/composables/useTrackEvent.ts`

```ts
const { trackEvent } = useTrackEvent()

trackEvent({
  key: 'create-collection',       // from catalog — required
  type: 'feature',                // 'feature' | 'page' — required
  name: 'Create collection',      // from catalog — required
  description: '...',             // from catalog — optional
  feature: 'Community Collections', // from catalog — optional
  properties: { collectionId },   // catalog-defined fields only — optional
})
```

`source` (current URL) and `entrySource` (referrer) are captured **automatically** — never pass them manually.

The call is always fire-and-forget: errors are caught inside the composable and never bubble up, so you will never break existing functionality by adding it.

## Step-by-step workflow

### 1. Read the events catalog

Always start by reading `references/events-catalog.md` to find the event that matches what the developer described. Copy the `key`, `type`, `name`, `description`, and `feature` values exactly — do not invent or rename them.

If no catalog entry matches, note this to the developer and suggest the closest match or a new entry following the naming conventions at the bottom of the catalog.

### 2. Identify the target file

Ask the developer which component or page to instrument, or infer it from context (e.g. "track when the user creates a collection" → look for the collection creation form/modal component).

Read the target file before making any changes. You need to understand:
- Whether `useTrackEvent` is already imported
- For **feature** events: which function handles the user action (button click, form submit, etc.)
- For **page** events: whether `onMounted` already exists

### 3. Insert the tracking call

#### Feature events (type: `'feature'`)

Place `trackEvent(...)` inside the action handler, **after** the main logic succeeds. Do not gate it behind a try/catch — the composable handles that internally.

```ts
const handleCreateCollection = async () => {
  // ... existing logic that creates the collection ...
  const result = await createCollection(...)

  trackEvent({
    key: 'create-collection',
    type: 'feature',
    name: 'Create collection',
    description: 'User creates a new collection.',
    feature: 'Community Collections',
    properties: { collectionId: result.id, isPrivate: form.isPrivate },
  })
}
```

For abandonment events (e.g. `abandoned-collection-creation`), fire when the user dismisses or navigates away without completing the flow — typically on modal close or route change before the success state is reached.

#### Page events (type: `'page'`)

Place inside `onMounted()`. If it already exists, add to it. If not, add it after the existing composable calls.

```ts
onMounted(() => {
  trackEvent({
    key: 'view-discover-collections',
    type: 'page',
    name: 'View Discover Collections',
    description: 'User views collections entry page.',
    feature: 'Community Collections',
  })
})
```

### 4. Add the import (if missing)

If `useTrackEvent` is not yet imported in the file, add it alongside the other composable imports:

```ts
const { trackEvent } = useTrackEvent()
```

In `<script setup>` files this goes at the top level of the script block. No need to import the function explicitly — Nuxt auto-imports composables from the `composables/` directory.

### 5. Verify

- The file still compiles (no TypeScript errors introduced)
- The tracking call does not change the control flow of the existing logic
- Properties only include fields listed in the catalog for that event

## Common patterns

### Properties with runtime values

Pass the actual runtime values, not placeholder strings:

```ts
// Good
properties: { collectionId: collection.id, isPrivate: collection.isPrivate }

// Bad
properties: { collectionId: 'collectionId', isPrivate: 'isPrivate' }
```

### Tracking after async operations

If the event should only fire on success (e.g. after a successful API call), place it after the `await` — not before:

```ts
await updateCollection(payload)
trackEvent({ key: 'update-collection', ... })
```

### Multiple events in one handler

Some handlers may trigger multiple catalog events (e.g. a save that also closes a modal). Track each separately in the right order.
