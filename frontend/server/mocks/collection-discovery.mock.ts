// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Collection } from '~~/types/collection';

export interface CollectionDiscoveryResponse {
  curatedCollections: Collection[];
  communityCollections: Collection[];
  myCollections: Collection[];
  likedCollections: Collection[];
}

export const communityCollectionsMock: Collection[] = [
  {
    id: 'community-1',
    name: 'Innovative Tools',
    slug: 'innovative-tools',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'Kubernetes',
        slug: 'kubernetes',
        logo: 'https://e7.pngegg.com/pngimages/938/554/png-clipart-white-and-blue-ship-wheel-illustration-kubernetes-logo-icons-logos-emojis-tech-companies.png',
      },
      {
        name: 'Linux',
        slug: 'linux',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      },
      { name: 'Helm', slug: 'helm', logo: 'https://helm.sh/img/helm.svg' },
      {
        name: 'Prometheus',
        slug: 'prometheus',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      },
      {
        name: 'Envoy',
        slug: 'envoy',
        logo: 'https://angular.io/assets/images/logos/angular/angular.svg',
      },
    ],
    updatedAt: '2025-02-01',
    owner: {
      name: 'November Echo',
      logo: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    },
    likeCount: 328,
    isLiked: false,
  },
  {
    id: 'community-2',
    name: 'Creative Solutions',
    slug: 'creative-solutions',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'React',
        slug: 'react',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      },
      { name: 'Vue', slug: 'vue', logo: 'https://vuejs.org/images/logo.png' },
      {
        name: 'Angular',
        slug: 'angular',
        logo: 'https://angular.io/assets/images/logos/angular/angular.svg',
      },
      {
        name: 'Svelte',
        slug: 'svelte',
        logo: 'https://svelte.dev/svelte-logo-horizontal.svg',
      },
      {
        name: 'Next.js',
        slug: 'nextjs',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      },
    ],
    updatedAt: '2025-02-01',
    owner: {
      name: 'November Echo',
      logo: 'https://avatars.githubusercontent.com/u/7654321?v=4',
    },
    likeCount: 156,
    isLiked: true,
  },
  {
    id: 'community-3',
    name: 'Tech Revolution',
    slug: 'tech-revolution',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'TensorFlow',
        slug: 'tensorflow',
        logo: 'https://www.tensorflow.org/images/tf_logo_social.png',
      },
      {
        name: 'PyTorch',
        slug: 'pytorch',
        logo: 'https://pytorch.org/assets/images/pytorch-logo.png',
      },
      {
        name: 'Scikit-learn',
        slug: 'scikit-learn',
        logo: 'https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png',
      },
      { name: 'Keras', slug: 'keras', logo: 'https://keras.io/img/logo.png' },
      {
        name: 'OpenCV',
        slug: 'opencv',
        logo: 'https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text-1.svg',
      },
    ],
    updatedAt: '2025-02-01',
    owner: {
      name: 'November Echo',
      logo: 'https://avatars.githubusercontent.com/u/9876543?v=4',
    },
    likeCount: 89,
    isLiked: false,
  },
];

export const myCollectionsMock: Collection[] = [
  {
    id: 'my-1',
    name: 'Future Tech',
    slug: 'future-tech',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'Kubernetes',
        slug: 'kubernetes',
        logo: 'https://e7.pngegg.com/pngimages/938/554/png-clipart-white-and-blue-ship-wheel-illustration-kubernetes-logo-icons-logos-emojis-tech-companies.png',
      },
      {
        name: 'Linux',
        slug: 'linux',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      },
      { name: 'Helm', slug: 'helm', logo: 'https://helm.sh/img/helm.svg' },
      {
        name: 'Prometheus',
        slug: 'prometheus',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      },
      {
        name: 'Envoy',
        slug: 'envoy',
        logo: 'https://angular.io/assets/images/logos/angular/angular.svg',
      },
    ],
    updatedAt: '2025-02-01',
    isPrivate: true,
  },
  {
    id: 'my-2',
    name: 'Community Driven',
    slug: 'community-driven',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'React',
        slug: 'react',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      },
      { name: 'Vue', slug: 'vue', logo: 'https://vuejs.org/images/logo.png' },
      {
        name: 'Angular',
        slug: 'angular',
        logo: 'https://angular.io/assets/images/logos/angular/angular.svg',
      },
      {
        name: 'Svelte',
        slug: 'svelte',
        logo: 'https://svelte.dev/svelte-logo-horizontal.svg',
      },
      {
        name: 'Next.js',
        slug: 'nextjs',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      },
    ],
    updatedAt: '2025-02-01',
    isPrivate: true,
  },
  {
    id: 'my-3',
    name: 'Open Innovation',
    slug: 'open-innovation',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [
      {
        name: 'TensorFlow',
        slug: 'tensorflow',
        logo: 'https://www.tensorflow.org/images/tf_logo_social.png',
      },
      {
        name: 'PyTorch',
        slug: 'pytorch',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      },
      {
        name: 'Scikit-learn',
        slug: 'scikit-learn',
        logo: 'https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png',
      },
      { name: 'Keras', slug: 'keras', logo: 'https://keras.io/img/logo.png' },
      {
        name: 'OpenCV',
        slug: 'opencv',
        logo: 'https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text-1.svg',
      },
    ],
    updatedAt: '2025-02-01',
    isPrivate: false,
  },
];

export const likedCollectionsMock: Collection[] = [
  {
    id: 'liked-1',
    name: 'Agentic AI Foundation',
    slug: 'agentic-ai-foundation',
    description: 'Agentic AI Foundation supports agentic AI projects.',
    isLf: true,
    projectCount: 10,
    featuredProjects: [],
    updatedAt: '2025-02-01',
    imageUrl: 'https://via.placeholder.com/384x120/1e3a5f/ffffff?text=Agentic+AI',
  },
  {
    id: 'liked-2',
    name: 'Creative Solutions',
    slug: 'creative-solutions',
    description:
      'Alias atque aut ducimus voluptate nulla deserunt explicabo itaque qui molestiae nulla.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [],
    updatedAt: '2025-02-01',
    owner: {
      name: 'November Echo',
      logo: 'https://avatars.githubusercontent.com/u/7654321?v=4',
    },
  },
  {
    id: 'liked-3',
    name: 'Tech Revolution',
    slug: 'tech-revolution',
    description: 'Necessitatibus sit iure recusandae nulla rerum inventore incidunt ut saepe.',
    isLf: false,
    projectCount: 10,
    featuredProjects: [],
    updatedAt: '2025-02-01',
    owner: {
      name: 'Red Hat',
      logo: 'https://www.redhat.com/cms/managed-files/Logo-Red_Hat-Hat-RGB.svg',
    },
  },
  {
    id: 'liked-4',
    name: 'FINOS (The Fintech Open Source Foundation)',
    slug: 'finos',
    description:
      'A curated list of the most essential open source projects, based on the OpenSSF Criticality Score. These projects power global infrastructure and are widely relied upon across industries.',
    isLf: true,
    projectCount: 10,
    featuredProjects: [],
    updatedAt: '2025-02-01',
  },
  {
    id: 'liked-5',
    name: 'PyTorch Foundation',
    slug: 'pytorch-foundation',
    description: 'Iusto eos aut deleniti corrupti laborum voluptatibus iste sapiente libero.',
    isLf: true,
    projectCount: 10,
    featuredProjects: [],
    updatedAt: '2025-02-01',
  },
];

export const getCollectionDiscoveryMock = (
  curatedCollections: Collection[] = [],
): CollectionDiscoveryResponse => ({
  curatedCollections,
  communityCollections: communityCollectionsMock,
  myCollections: myCollectionsMock,
  likedCollections: likedCollectionsMock,
});
