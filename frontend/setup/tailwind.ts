// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export default {
  exposeConfig: true,
  viewer: { endpoint: '/_tailwind', exportViewer: true },
  config: {
    safelist: [
      'bg-negative-900',
      'bg-negative-500',
      'bg-warning-500',
      'bg-accent-500',
      'bg-positive-500',
      'text-accent-500',
      'text-positive-500',
      'text-neutral-600',
      '!text-neutral-600',
    ],
  },
};
