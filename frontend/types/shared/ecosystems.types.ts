// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export enum EcosystemKeys {
  GO = 'go',
  NPM = 'npm',
  PYPI = 'pypi',
  RUBYGEMS = 'rubygems',
  MAVEN = 'maven',
  NUGET = 'nuget',
  CONDA = 'conda',
}

export interface Ecosystem {
  key: string;
  label: string;
  image: string;
}

export const EcosystemSeparator = '::';
