// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { EcosystemKeys, type Ecosystem } from '~~/types/shared/ecosystems.types';

export const ecosystems: Record<string, Ecosystem> = {
  go: {
    key: EcosystemKeys.GO,
    label: 'Go',
    image: '/images/ecosystems/go.png',
  },
  npm: {
    key: EcosystemKeys.NPM,
    label: 'NPM',
    image: '/images/ecosystems/npm.png',
  },
  pypi: {
    key: EcosystemKeys.PYPI,
    label: 'PyPI',
    image: '/images/ecosystems/pypi.png',
  },
  rubygems: {
    key: EcosystemKeys.RUBYGEMS,
    label: 'RubyGems',
    image: '/images/ecosystems/rubygems.png',
  },
  maven: {
    key: EcosystemKeys.MAVEN,
    label: 'Maven',
    image: '/images/ecosystems/maven.png',
  },
  nuget: {
    key: EcosystemKeys.NUGET,
    label: 'NuGet',
    image: '/images/ecosystems/nuget.png',
  },
  conda: {
    key: EcosystemKeys.CONDA,
    label: 'Conda',
    image: '/images/ecosystems/conda.png',
  },
  // TODO: Add images for the following ecosystems
  actions: {
    key: EcosystemKeys.ACTIONS,
    label: 'Actions',
    image: '/images/ecosystems/generic.png',
  },
  adelie: {
    key: EcosystemKeys.ADELIE,
    label: 'Adelie',
    image: '/images/ecosystems/generic.png',
  },
  alpine: {
    key: EcosystemKeys.ALPINE,
    label: 'Alpine',
    image: '/images/ecosystems/generic.png',
  },
  bower: {
    key: EcosystemKeys.BOWER,
    label: 'Bower',
    image: '/images/ecosystems/generic.png',
  },
  cargo: {
    key: EcosystemKeys.CARGO,
    label: 'Cargo',
    image: '/images/ecosystems/generic.png',
  },
  carthage: {
    key: EcosystemKeys.CARTHAGE,
    label: 'Carthage',
    image: '/images/ecosystems/generic.png',
  },
  clojars: {
    key: EcosystemKeys.CLOJARS,
    label: 'Clojars',
    image: '/images/ecosystems/generic.png',
  },
  cocoapods: {
    key: EcosystemKeys.COCOAPODS,
    label: 'CocoaPods',
    image: '/images/ecosystems/generic.png',
  },
  cpan: {
    key: EcosystemKeys.CPAN,
    label: 'CPAN',
    image: '/images/ecosystems/generic.png',
  },
  cran: {
    key: EcosystemKeys.CRAN,
    label: 'CRAN',
    image: '/images/ecosystems/generic.png',
  },
  deno: {
    key: EcosystemKeys.DENO,
    label: 'Deno',
    image: '/images/ecosystems/generic.png',
  },
  docker: {
    key: EcosystemKeys.DOCKER,
    label: 'Docker',
    image: '/images/ecosystems/generic.png',
  },
  elm: {
    key: EcosystemKeys.ELM,
    label: 'Elm',
    image: '/images/ecosystems/generic.png',
  },
  hackage: {
    key: EcosystemKeys.HACKAGE,
    label: 'Hackage',
    image: '/images/ecosystems/generic.png',
  },
  hex: {
    key: EcosystemKeys.HEX,
    label: 'Hex',
    image: '/images/ecosystems/generic.png',
  },
  homebrew: {
    key: EcosystemKeys.HOMEBREW,
    label: 'Homebrew',
    image: '/images/ecosystems/generic.png',
  },
  julia: {
    key: EcosystemKeys.JULIA,
    label: 'Julia',
    image: '/images/ecosystems/generic.png',
  },
  packagist: {
    key: EcosystemKeys.PACKAGIST,
    label: 'Packagist',
    image: '/images/ecosystems/generic.png',
  },
  postmarketos: {
    key: EcosystemKeys.POSTMARKETOS,
    label: 'PostmarketOS',
    image: '/images/ecosystems/generic.png',
  },
  pub: {
    key: EcosystemKeys.PUB,
    label: 'Pub',
    image: '/images/ecosystems/generic.png',
  },
  puppet: {
    key: EcosystemKeys.PUPPET,
    label: 'Puppet',
    image: '/images/ecosystems/generic.png',
  },
  racket: {
    key: EcosystemKeys.RACKET,
    label: 'Racket',
    image: '/images/ecosystems/generic.png',
  },
  spack: {
    key: EcosystemKeys.SPACK,
    label: 'Spack',
    image: '/images/ecosystems/generic.png',
  },
  swiftpm: {
    key: EcosystemKeys.SWIFTPM,
    label: 'SwiftPM',
    image: '/images/ecosystems/generic.png',
  },
  vcpkg: {
    key: EcosystemKeys.VCPKG,
    label: 'vcpkg',
    image: '/images/ecosystems/generic.png',
  },
};
