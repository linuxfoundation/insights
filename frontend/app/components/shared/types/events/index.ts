// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { COLLECTIONS_EVENT_DEFINITIONS, CollectionsEventKey } from './collections';

export type EventKey = CollectionsEventKey;

export enum EventType {
  FEATURE = 'feature',
  PAGE = 'page',
}

export enum EventFeature {
  COMMUNITY_COLLECTIONS = 'Community Collections',
}

export interface EventDefinition {
  key: EventKey;
  type: EventType;
  name: string;
  feature: EventFeature;
}

export const EVENT_DEFINITIONS: Record<EventKey, EventDefinition> = {
  ...COLLECTIONS_EVENT_DEFINITIONS,
};
