// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import rateLimiter from './rate-limiter';

const isProduction = process.env.NUXT_APP_ENV === 'production';

export default {
  // These are only available on the server-side and can be overridden by the .env file
  appEnv: process.env.APP_ENV,
  tinybirdBaseUrl: 'https://api.us-west-2.aws.tinybird.co',
  tinybirdToken: '',
  highlightedIds: '',
  redisUrl: '',
  githubApiToken: '',
  lfxAuth0JwtSecret: '',
  lfxAuth0TokenClaimGroupKey: '',
  lfxAuth0TokenClaimGroupName: '',
  auth0ClientSecret: '',
  auth0CookieDomain: 'insights.linuxfoundation.org',
  jwtSecret: '',
  insightsDbWriteHost: 'localhost',
  insightsDbReadHost: 'localhost',
  insightsDbPort: 5432,
  insightsDbUsername: 'postgres',
  insightsDbPassword: 'example',
  insightsDbDatabase: 'insights',
  cmDbEnabled: isProduction,
  cmDbWriteHost: 'localhost',
  cmDbReadHost: 'localhost',
  cmDbPort: 5432,
  cmDbUsername: 'postgres',
  cmDbPassword: 'example',
  cmDbDatabase: 'crowd-web',
  temporalServerUrl: 'localhost:7233',
  temporalNamespace: 'default',
  temporalCertificate: '',
  temporalPrivateKey: '',
  temporalEncryptionKeyId: 'local',
  temporalEncryptionKey: '',
  securityGithubToken: '',
  dataCopilotDefaultSegmentId: '',
  rateLimiter: rateLimiter,
  // These are also exposed on the client-side
  public: {
    apiBase: '/api',
    appUrl: isProduction ? 'https://insights.linuxfoundation.org' : 'http://localhost:3000',
    appEnv: process.env.APP_ENV,
    auth0Domain: isProduction
      ? 'https://sso.linuxfoundation.org'
      : 'https://linuxfoundation-staging.auth0.com',
    auth0ClientId: '',
    auth0RedirectUri: isProduction
      ? 'https://insights.linuxfoundation.org/auth/callback'
      : 'http://localhost:3000/auth/callback',
    auth0Audience: isProduction
      ? 'https://insights.linuxfoundation.org/api/'
      : 'http://localhost:3000/api/',
    lfxSegmentCdnUrl: process.env.LFX_SEGMENT_CDN_URL || '',
  },
};
