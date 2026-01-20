// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const isProduction = process.env.NUXT_APP_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  disallow: isProduction || isDevelopment ? [] : ['/'],
};
