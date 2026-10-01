// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from 'vitest';

const poolOptions = vi.hoisted(() => [] as unknown[]);

vi.mock('pg', () => ({
  Pool: vi.fn(function (this: unknown, options: unknown) {
    poolOptions.push(options);
  }),
}));

import { createPostgresPool } from '../src/index.js';

const config = {
  host: 'db.test',
  port: 5432,
  database: 'crowd-web',
  user: 'reader',
  password: 'secret',
};

describe('createPostgresPool', () => {
  it('passes the connection settings through, with TLS on', () => {
    createPostgresPool({ ...config, ssl: true });

    expect(poolOptions.at(-1)).toEqual({
      ...config,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: { rejectUnauthorized: false },
    });
  });

  it('turns TLS off when ssl is false', () => {
    createPostgresPool({ ...config, ssl: false });

    expect(poolOptions.at(-1)).toMatchObject({ ssl: false });
  });
});
