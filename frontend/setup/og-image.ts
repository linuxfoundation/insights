// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default {
  fonts: [
    {
      name: 'Inter',
      weight: 400,
      path: '/fonts/Inter-Regular.ttf',
    },
    {
      name: 'Roboto Slab',
      weight: 300,
      path: '/fonts/RobotoSlab-Light.ttf',
    },
    {
      name: 'Roboto Slab',
      weight: 400,
      path: '/fonts/RobotoSlab-Regular.ttf',
    },
    {
      name: 'Roboto Slab',
      weight: 700,
      path: '/fonts/RobotoSlab-Bold.ttf',
    },
  ],
  // Use compatibility mode to prevent resvg crashes from taking down the app
  compatibility: {
    runtime: {
      resvg: 'node',
      satori: 'node',
    },
  },
};
