// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';

export interface ShareData {
  title?: string;
  url: string; // Full url which needs to be shared
  area?: string; // Area displayed in the sharing modal
  showGithubBadge?: boolean;
  activeTab?: 'link' | 'github-badge';
  additionalShare?: Component;
}
