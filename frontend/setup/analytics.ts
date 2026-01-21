// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const isProduction = process.env.NUXT_APP_ENV === 'production';

export const gtag = {
  enabled: isProduction,
  id: 'G-EB92ZZFBNS',
};

export const plausible = {
  // Use as fallback if no runtime config is available at runtime
  enabled: isProduction,
  domain: 'insights.linuxfoundation.org',
};
