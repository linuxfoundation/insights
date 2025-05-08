// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const messageStyles = ['default', 'info', 'positive', 'warning', 'negative'] as const;
export const messageSizes = ['default', 'small'] as const;
export const messageTypes = ['box', 'transparent'] as const;

export type MessageStyle = (typeof messageStyles)[number];
export type MessageSize = (typeof messageSizes)[number];
export type MessageType = (typeof messageTypes)[number];
