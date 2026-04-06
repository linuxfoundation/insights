# Insights Events Catalog

All approved events for the Insights application. Use the exact `enum value` when calling `trackEvent`. Only pass `properties` fields listed below — no extras.

---

## Community Collections

**Key enum:** `CollectionsEventKey` from `~/components/shared/types/events/collections`

| enum value | key | type | name | properties |
|------------|-----|------|------|------------|
| `CREATE_COLLECTION` | `create-collection` | `feature` | `Create collection` | `collectionId`, `isPrivate` |
| `UPDATE_COLLECTION` | `update-collection` | `feature` | `Update collection` | `collectionId`, `changedFields` (e.g. `['name', 'privacy']`) |
| `DELETE_COLLECTION` | `delete-collection` | `feature` | `Delete collection` | `collectionId` |
| `SHARE_COLLECTION` | `share-collection` | `feature` | `Share collection` | `collectionId`, `shareMethod` |
| `VIEW_COLLECTION` | `view-collection` | `feature` | `View collection` | `collectionId`, `viewerType` (`'owner'` or `'guest'`) |
| `LIKE_COLLECTION` | `like-collection` | `feature` | `Like collection` | `collectionId` |
| `DISLIKE_COLLECTION` | `dislike-collection` | `feature` | `Dislike collection` | `collectionId` |
| `VIEW_DISCOVER_COLLECTIONS` | `view-discover-collections` | `page` | `View Discover Collections` | — |
| `VIEW_CURATED_COLLECTIONS` | `view-curated-collections` | `page` | `View Curated Collections` | — |
| `VIEW_COMMUNITY_COLLECTIONS` | `view-community-collections` | `page` | `View Community Collections` | — |
| `VIEW_MY_COLLECTIONS` | `view-my-collections` | `page` | `View My Collections` | — |
| `DUPLICATE_COLLECTION` | `duplicate-collection` | `feature` | `Duplicate collections` | `sourceCollectionId` |
| `ADD_PROJECT_TO_COLLECTION` | `add-project-to-collection` | `feature` | `Add project to collection` | `collectionId`, `projectId` |
| `ABANDONED_COLLECTION_CREATION` | `abandoned-collection-creation` | `feature` | `Abandoned collection creation` | — |
| `ABANDONED_COLLECTION_DUPLICATION` | `abandoned-collection-duplication` | `feature` | `Abandoned collection duplication` | — |
| `ABANDONED_COLLECTION_EDITION` | `abandoned-collection-edition` | `feature` | `Abandoned collection edition` | `collectionId` |

---

## Adding new events

When implementing an event not yet in this catalog, inform the developer so the catalog can be updated.

**Naming conventions:**
- `key`: kebab-case, verb-noun format (e.g. `create-collection`)
- `type`: `'page'` for page views, `'feature'` for user interactions
- `feature`: the product area name (e.g. `'Community Collections'`)
- enum value: SCREAMING_SNAKE_CASE matching the key (e.g. `CREATE_COLLECTION`)

**New feature checklist:**
1. Create `events/<feature>.ts` with the key enum and definitions
2. Re-export from `events/index.ts` (extend `EventKey` union + spread definitions)
3. Add `EventFeature.<FEATURE>` to the enum in `index.ts`
4. Add a new section to this catalog
