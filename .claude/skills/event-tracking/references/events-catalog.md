# Insights Events Catalog

All approved events for the Insights application. Always use these exact values for `key`, `type`, `name`, `description`, and `feature`. Only pass `properties` fields listed below — no extras.

## Community Collections

| key | type | name | description | properties |
|-----|------|------|-------------|------------|
| `create-collection` | `feature` | `Create collection` | User creates a new collection. | `collectionId`, `isPrivate` |
| `update-collection` | `feature` | `Update collection` | User modifies the name, description, or privacy settings of a collection. | `collectionId`, `changedFields` (e.g. `['name', 'privacy']`) |
| `delete-collection` | `feature` | `Delete collection` | User permanently deletes a collection. | `collectionId` |
| `share-collection` | `feature` | `Share collection` | User shares a collection. | `collectionId`, `shareMethod` |
| `view-collection` | `feature` | `View collection` | A user views the main page of a collection. | `collectionId`, `viewerType` (e.g. `'owner'` or `'guest'`) |
| `like-collection` | `feature` | `Like collection` | A user likes a collection. | `collectionId` |
| `dislike-collection` | `feature` | `Dislike collection` | A user dislikes a collection. | `collectionId` |
| `view-collections` | `feature` | `View collections` | User views the list/feed of all collections or featured collections. | `collectionId`, `collectionType` (`'curated'`, `'community'`, or `'my'`) |
| `view-discover-collections` | `page` | `View Discover Collections` | User views collections entry page. | — |
| `view-curated-collections` | `page` | `View Curated Collections` | User views all curated collections. | — |
| `view-community-collections` | `page` | `View Community Collections` | User views all community collections. | — |
| `view-my-collections` | `page` | `View My Collections` | User views all personal collections. | — |
| `duplicate-collection` | `feature` | `Duplicate collections` | User creates a copy of an existing collection. | `sourceCollectionId`, `newCollectionId` |
| `add-project-to-collection` | `feature` | `Add project to collection` | User adds a project item to a collection. | `collectionId`, `projectId` |
| `abandoned-collection-creation` | `feature` | `Abandoned collection creation` | User started but did not complete the collection creation flow. | — |
| `abandoned-collection-duplication` | `feature` | `Abandoned collection duplication` | User started but did not complete the collection duplication flow. | — |
| `abandoned-collection-edition` | `feature` | `Abandoned collection edition` | User started modifying a collection but exited or failed to save the changes. | `collectionId` |

## Adding new events

When implementing an event not yet in this catalog, note it so the catalog can be updated. Use the same naming conventions:
- `key`: kebab-case, verb-noun format (e.g. `create-collection`)
- `type`: `'page'` for page views, `'feature'` for user interactions
- `feature`: the product area name (e.g. `'Community Collections'`)
