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
  ACTIONS = 'actions',
  ADELIE = 'adelie',
  ALPINE = 'alpine',
  BOWER = 'bower',
  CARGO = 'cargo',
  CARTHAGE = 'carthage',
  CLOJARS = 'clojars',
  COCOAPODS = 'cocoapods',
  CPAN = 'cpan',
  CRAN = 'cran',
  DENO = 'deno',
  DOCKER = 'docker',
  ELM = 'elm',
  HACKAGE = 'hackage',
  HEX = 'hex',
  HOMEBREW = 'homebrew',
  JULIA = 'julia',
  PACKAGIST = 'packagist',
  POSTMARKETOS = 'postmarketos',
  PUB = 'pub',
  PUPPET = 'puppet',
  RACKET = 'racket',
  SPACK = 'spack',
  SWIFTPM = 'swiftpm',
  VCPKG = 'vcpkg',
}

export interface Ecosystem {
  key: string;
  label: string;
  image: string;
}

export const EcosystemSeparator = '::';
