// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';

export type ExploreType = 'project' | 'contributor' | 'organization';
export interface ExploreTab {
  title: string;
  description: string;
  component: Component;
  icon: string;
  type: ExploreType;
}
