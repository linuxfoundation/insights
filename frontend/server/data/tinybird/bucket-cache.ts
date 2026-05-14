// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { client } from './tinybird';

export async function getBucketIdForProject(
  project: string,
  _fetcher?: unknown,
): Promise<number | null> {
  return client.getBucketIdForProject(project);
}
