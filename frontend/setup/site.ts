// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const isProduction = process.env.NUXT_APP_ENV === 'production';

export default {
  url: isProduction ? 'https://insights.linuxfoundation.org' : 'http://localhost:3000',
  name: 'LFX Insights',
};
