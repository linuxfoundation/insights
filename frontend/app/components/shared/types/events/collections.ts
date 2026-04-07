// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { EventFeature, EventType, type EventDefinition } from './base';

export enum CollectionsEventKey {
  CREATE_COLLECTION = 'create-collection',
  UPDATE_COLLECTION = 'update-collection',
  DELETE_COLLECTION = 'delete-collection',
  SHARE_COLLECTION = 'share-collection',
  VIEW_COLLECTION = 'view-collection',
  LIKE_COLLECTION = 'like-collection',
  DISLIKE_COLLECTION = 'dislike-collection',
  VIEW_DISCOVER_COLLECTIONS = 'view-discover-collections',
  VIEW_CURATED_COLLECTIONS = 'view-curated-collections',
  VIEW_COMMUNITY_COLLECTIONS = 'view-community-collections',
  VIEW_MY_COLLECTIONS = 'view-my-collections',
  DUPLICATE_COLLECTION = 'duplicate-collection',
  ADD_PROJECT_TO_COLLECTION = 'add-project-to-collection',
  ADD_REPO_TO_COLLECTION = 'add-repo-to-collection',
  ABANDONED_COLLECTION_CREATION = 'abandoned-collection-creation',
  ABANDONED_COLLECTION_DUPLICATION = 'abandoned-collection-duplication',
  ABANDONED_COLLECTION_EDITION = 'abandoned-collection-edition',
}

export const COLLECTIONS_EVENT_DEFINITIONS: Record<CollectionsEventKey, EventDefinition> = {
  [CollectionsEventKey.CREATE_COLLECTION]: {
    key: CollectionsEventKey.CREATE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Create collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.UPDATE_COLLECTION]: {
    key: CollectionsEventKey.UPDATE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Update collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.DELETE_COLLECTION]: {
    key: CollectionsEventKey.DELETE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Delete collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.SHARE_COLLECTION]: {
    key: CollectionsEventKey.SHARE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Share collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.VIEW_COLLECTION]: {
    key: CollectionsEventKey.VIEW_COLLECTION,
    type: EventType.FEATURE,
    name: 'View collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.LIKE_COLLECTION]: {
    key: CollectionsEventKey.LIKE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Like collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.DISLIKE_COLLECTION]: {
    key: CollectionsEventKey.DISLIKE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Dislike collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.VIEW_DISCOVER_COLLECTIONS]: {
    key: CollectionsEventKey.VIEW_DISCOVER_COLLECTIONS,
    type: EventType.PAGE,
    name: 'View Discover Collections',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.VIEW_CURATED_COLLECTIONS]: {
    key: CollectionsEventKey.VIEW_CURATED_COLLECTIONS,
    type: EventType.PAGE,
    name: 'View Curated Collections',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.VIEW_COMMUNITY_COLLECTIONS]: {
    key: CollectionsEventKey.VIEW_COMMUNITY_COLLECTIONS,
    type: EventType.PAGE,
    name: 'View Community Collections',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.VIEW_MY_COLLECTIONS]: {
    key: CollectionsEventKey.VIEW_MY_COLLECTIONS,
    type: EventType.PAGE,
    name: 'View My Collections',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.DUPLICATE_COLLECTION]: {
    key: CollectionsEventKey.DUPLICATE_COLLECTION,
    type: EventType.FEATURE,
    name: 'Duplicate collections',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.ADD_PROJECT_TO_COLLECTION]: {
    key: CollectionsEventKey.ADD_PROJECT_TO_COLLECTION,
    type: EventType.FEATURE,
    name: 'Add project to collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.ADD_REPO_TO_COLLECTION]: {
    key: CollectionsEventKey.ADD_REPO_TO_COLLECTION,
    type: EventType.FEATURE,
    name: 'Add repo to collection',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.ABANDONED_COLLECTION_CREATION]: {
    key: CollectionsEventKey.ABANDONED_COLLECTION_CREATION,
    type: EventType.FEATURE,
    name: 'Abandoned collection creation',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.ABANDONED_COLLECTION_DUPLICATION]: {
    key: CollectionsEventKey.ABANDONED_COLLECTION_DUPLICATION,
    type: EventType.FEATURE,
    name: 'Abandoned collection duplication',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
  [CollectionsEventKey.ABANDONED_COLLECTION_EDITION]: {
    key: CollectionsEventKey.ABANDONED_COLLECTION_EDITION,
    type: EventType.FEATURE,
    name: 'Abandoned collection edition',
    feature: EventFeature.COMMUNITY_COLLECTIONS,
  },
};
