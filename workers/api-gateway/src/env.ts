// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface Env {
  ORIGIN_URL: string;
  INSIGHTS_API?: Fetcher;
  PAT_HASH_SALT: string;
  LFX_API_URL: string;
  M2M_ISSUER_URL: string;
  M2M_AUDIENCE: string;
  M2M_CLIENT_ID: string;
  M2M_PRIVATE_KEY: string;
  LD_SDK_KEY: string;
  LD_FLAG_URL: string;
  STUB_PAT: string;
  STUB_USERNAME: string;
}
