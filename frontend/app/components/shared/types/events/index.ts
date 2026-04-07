// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { EventDefinition } from './base';
import { COLLECTIONS_EVENT_DEFINITIONS, CollectionsEventKey } from './collections';

export type EventKey = CollectionsEventKey;

export const EVENT_DEFINITIONS: Record<EventKey, EventDefinition> = {
  ...COLLECTIONS_EVENT_DEFINITIONS,
};
