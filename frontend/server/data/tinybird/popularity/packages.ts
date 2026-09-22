// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Package } from '~~/types/popularity/responses.types';

import type { PackageFilter } from '../../types';
import { fetchFromTinybird } from '../tinybird';

export async function fetchPackages(filter: PackageFilter): Promise<Package[]> {
  const path = '/v0/pipes/packages.json';
  const response = await fetchFromTinybird<Package[]>(path, filter);

  return response.data;
}
