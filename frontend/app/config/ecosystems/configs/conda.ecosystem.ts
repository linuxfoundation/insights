// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { EcosystemKeys } from '~~/types/shared/ecosystems.types';
import type { Ecosystem } from '~~/types/shared/ecosystems.types';

export const conda: Ecosystem = {
  key: EcosystemKeys.CONDA,
  label: 'Conda',
  image: '/images/ecosystems/conda.png',
};
