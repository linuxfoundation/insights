// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export enum EventType {
  FEATURE = 'feature',
  PAGE = 'page',
}

export enum EventFeature {
  COMMUNITY_COLLECTIONS = 'Community Collections',
}

export interface EventDefinition<K extends string = string> {
  key: K;
  type: EventType;
  name: string;
  feature: EventFeature;
}
