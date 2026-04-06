# Insights Events Catalog

All approved events for the Insights application. Always use these exact values for `key`, `type`, `name`, `description`, and `feature`. Only pass `properties` fields listed below — no extras.

## Community Collections

| key | type | name | properties |
|-----|------|------|------------|
| `create-collection` | `feature` | `Create collection` | `newCollectionId`, `isPrivate` |
| `update-collection` | `feature` | `Update collection` | `collectionId`, `changedFields` (e.g. `['name', 'privacy']`) |
| `delete-collection` | `feature` | `Delete collection` | `collectionId` |
| `share-collection` | `feature` | `Share collection` | `collectionId`, `shareMethod` |
| `view-collection` | `feature` | `View collection` | `collectionId`, `viewerType` (e.g. `'owner'` or `'guest'`) |
| `like-collection` | `feature` | `Like collection` | `collectionId` |
| `dislike-collection` | `feature` | `Dislike collection` | `collectionId` |
| `view-discover-collections` | `page` | `View Discover Collections` | — |
| `view-curated-collections` | `page` | `View Curated Collections` | — |
| `view-community-collections` | `page` | `View Community Collections` | — |
| `view-my-collections` | `page` | `View My Collections` | — |
| `duplicate-collection` | `feature` | `Duplicate collections` | `sourceCollectionId`, `newCollectionId` |
| `add-project-to-collection` | `feature` | `Add project to collection` | `collectionId`, `projectId` |
| `abandoned-collection-creation` | `feature` | `Abandoned collection creation` | — |
| `abandoned-collection-duplication` | `feature` | `Abandoned collection duplication` | — |
| `abandoned-collection-edition` | `feature` | `Abandoned collection edition` | `sourceCollectionId` |

## Adding new events

When implementing an event not yet in this catalog, note it so the catalog can be updated. Use the same naming conventions:
- `key`: kebab-case, verb-noun format (e.g. `create-collection`)
- `type`: `'page'` for page views, `'feature'` for user interactions
- `feature`: the product area name (e.g. `'Community Collections'`)
