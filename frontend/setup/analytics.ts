// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const isProduction = process.env.NUXT_APP_ENV === 'production';

export const gtag = {
  enabled: isProduction,
  id: 'G-EB92ZZFBNS',
  // Google Consent Mode v2 defaults; Transcend (setup/head.ts) grants consent once the user opts in.
  initCommands: [
    [
      'consent',
      'default',
      {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500,
      },
    ],
    ['set', 'ads_data_redaction', true],
    ['set', 'url_passthrough', true],
  ],
};

export const plausible = {
  // Use as fallback if no runtime config is available at runtime
  enabled: isProduction,
  domain: 'insights.linuxfoundation.org',
};
