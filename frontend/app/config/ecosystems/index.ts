// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { go } from './configs/go.ecosystem';
import { npm } from './configs/npm.ecosystem';
import { pypi } from './configs/pypi.ecosystem';
import { rubygems } from './configs/rubygems.ecosystem';
import { maven } from './configs/maven.ecosystem';
import { nuget } from './configs/nuget.ecosystem';
import { conda } from './configs/conda.ecosystem';
import type { Ecosystem } from '~~/types/shared/ecosystems.types';

export const ecosystems: Record<string, Ecosystem> = {
  go,
  npm,
  pypi,
  rubygems,
  maven,
  nuget,
  conda,
};
