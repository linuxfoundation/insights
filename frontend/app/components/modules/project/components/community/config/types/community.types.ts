// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export interface CommunityConfig {
  key: string;
  platform: PlatformConfig;
  dataDisplay: Component;
}
