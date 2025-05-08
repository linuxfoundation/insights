// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface ActivityType {
  key: string;
  label: string;
}

export interface PlatformConfig {
  key: string;
  label: string;
  image: string;
  activityTypes: ActivityType[];
}
