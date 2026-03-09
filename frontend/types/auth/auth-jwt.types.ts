// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { JwtPayload } from 'jsonwebtoken';

export interface DecodedOidcToken {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
  updated_at?: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  original_id_token?: string;
  hasLfxInsightsPermission?: boolean;
  isLfInsightsTeamMember?: boolean;
}

export interface DecodedIdToken extends JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
  updated_at?: string;

  [key: string]: string[] | string | number | boolean | undefined;
}
