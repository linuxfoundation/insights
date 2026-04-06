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

## File structure

```
frontend/app/components/shared/types/events/
├── index.ts          # EventType, EventFeature enums; EventDefinition interface;
│                     # EventKey union type; aggregated EVENT_DEFINITIONS record
└── collections.ts    # CollectionsEventKey enum + COLLECTIONS_EVENT_DEFINITIONS
    <feature>.ts      # (future) FeatureEventKey enum + FEATURE_EVENT_DEFINITIONS

frontend/composables/useTrackEvent.ts   # just the tracking function
```

**Adding events for a new feature:** create `events/<feature>.ts`, define its `<Feature>EventKey` enum and `<FEATURE>_EVENT_DEFINITIONS` record, then re-export both from `index.ts`.

**`index.ts` shape:**
```ts
export type EventKey = CollectionsEventKey // | FutureFeatureEventKey | ...
export const EVENT_DEFINITIONS: Record<EventKey, EventDefinition> = {
  ...COLLECTIONS_EVENT_DEFINITIONS,
  // ...FUTURE_FEATURE_EVENT_DEFINITIONS,
}
```

## How to use

Always use the **feature-specific key enum** (e.g. `CollectionsEventKey`), not the union `EventKey` type. The composable itself only needs `useTrackEvent` — the key enum comes from the feature's events file.

```ts
import { useTrackEvent } from '~~/composables/useTrackEvent';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';

const { trackEvent } = useTrackEvent()

trackEvent({
  key: CollectionsEventKey.CREATE_COLLECTION,
  properties: { collectionId, isPrivate },  // catalog-defined fields only — optional
})
```

`name`, `type`, `description`, and `feature` are looked up automatically from `EVENT_DEFINITIONS` — **never pass them in the call**.

`source` (current URL) and `entrySource` (referrer) are captured **automatically** — never pass them manually.

The call is always fire-and-forget: errors are caught inside the composable and never bubble up.

## Step-by-step workflow

### 1. Read the events catalog

Always start by reading `references/events-catalog.md` to find the event that matches what the developer described. The catalog is organized by feature section (e.g. "Community Collections"). Note the `enum value` and `properties` columns — use those exactly.

If no catalog entry matches, note this to the developer and suggest the closest match or a new entry following the conventions at the bottom of the catalog.

### 2. Identify the target file and feature

Infer the feature from context (e.g. "track when the user creates a collection" → Community Collections). This tells you which key enum to import:

| Feature | Key enum | Import path |
|---------|----------|-------------|
| Community Collections | `CollectionsEventKey` | `~/components/shared/types/events/collections` |
| (future features) | `<Feature>EventKey` | `~/components/shared/types/events/<feature>` |

Read the target component or page file before making any changes. You need to understand:
- Whether `useTrackEvent` is already imported
- For **feature** events: which function handles the user action
- For **page** events: whether `onMounted` already exists

### 3. Insert the tracking call

#### Feature events

Place `trackEvent(...)` inside the action handler, **after** the main logic succeeds.

```ts
const handleCreateCollection = async () => {
  const result = await createCollection(...)

  trackEvent({
    key: CollectionsEventKey.CREATE_COLLECTION,
    properties: { collectionId: result.id, isPrivate: form.isPrivate },
  })
}
```

For abandonment events, fire when the user dismisses or navigates away without completing the flow — typically on modal close before the success state is reached.

#### Page events

Place inside `onMounted()`. Add to an existing `onMounted` if one already exists.

```ts
onMounted(() => {
  trackEvent({ key: CollectionsEventKey.VIEW_DISCOVER_COLLECTIONS })
})
```

#### Events that need async data (e.g. `viewerType`)

If the event requires data that loads asynchronously (e.g. collection details needed to determine `viewerType`), use `watch` with `{ once: true }` instead of `onMounted`:

```ts
watch(data, (collection) => {
  if (!collection) return
  trackEvent({
    key: CollectionsEventKey.VIEW_COLLECTION,
    properties: {
      collectionId: collection.id,
      viewerType: collection.ssoUserId && user.value?.sub === collection.ssoUserId ? 'owner' : 'guest',
    },
  })
}, { once: true })
```

### 4. Add the imports (if missing)

```ts
import { useTrackEvent } from '~~/composables/useTrackEvent';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';
```

Then destructure at the top level of `<script setup>`:

```ts
const { trackEvent } = useTrackEvent()
```

The `~~` alias points to `frontend/`, `~` points to `frontend/app/`. Neither is auto-imported.

### 5. Verify

- No TypeScript errors introduced
- The tracking call does not change the control flow of existing logic
- Properties only include fields listed in the catalog for that event

## Common patterns

### Properties with runtime values

```ts
// Good
properties: { collectionId: collection.id, isPrivate: collection.isPrivate }

// Bad
properties: { collectionId: 'collectionId', isPrivate: 'isPrivate' }
```

### Tracking after async operations

Place after the `await` so it only fires on success:

```ts
await updateCollection(payload)
trackEvent({ key: CollectionsEventKey.UPDATE_COLLECTION, properties: { collectionId, changedFields } })
```

### Multiple events in one handler

Track each separately in the right order.

## Adding events for a new feature

1. Create `frontend/app/components/shared/types/events/<feature>.ts`:
   ```ts
   import { EventFeature, EventType, type EventDefinition } from '.';

   export enum MyFeatureEventKey {
     DO_THING = 'do-thing',
   }

   export const MY_FEATURE_EVENT_DEFINITIONS: Record<MyFeatureEventKey, EventDefinition> = {
     [MyFeatureEventKey.DO_THING]: {
       key: MyFeatureEventKey.DO_THING,
       type: EventType.FEATURE,
       name: 'Do thing',
       feature: EventFeature.MY_FEATURE,
     },
   };
   ```

2. In `index.ts`, extend the union and spread into `EVENT_DEFINITIONS`:
   ```ts
   export type EventKey = CollectionsEventKey | MyFeatureEventKey
   export const EVENT_DEFINITIONS = {
     ...COLLECTIONS_EVENT_DEFINITIONS,
     ...MY_FEATURE_EVENT_DEFINITIONS,
   }
   ```

3. Add `EventFeature.MY_FEATURE` to the `EventFeature` enum in `index.ts`.

4. Add the new events to `references/events-catalog.md` under a new section.
