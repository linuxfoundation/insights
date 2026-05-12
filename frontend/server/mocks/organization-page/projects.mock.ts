// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const mockOrganizationProjects = {
  meta: [
    { name: 'projectSlug', type: 'String' },
    { name: 'projectName', type: 'String' },
    { name: 'projectLogo', type: 'String' },
    { name: 'healthScore', type: 'String' },
    { name: 'technicalInfluence', type: 'String' },
    { name: 'activityCount', type: 'UInt64' },
    { name: 'contributorCount', type: 'UInt64' },
  ],
  data: [
    {
      projectSlug: 'kubernetes',
      projectName: 'Kubernetes',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/kubernetes/icon/color/kubernetes-icon-color.svg',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 45230,
      contributorCount: 791,
    },
    {
      projectSlug: 'golang',
      projectName: 'Go',
      projectLogo: 'https://raw.githubusercontent.com/github/explore/main/topics/go/go.png',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 38100,
      contributorCount: 581,
    },
    {
      projectSlug: 'envoy',
      projectName: 'Envoy',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/envoy/icon/color/envoy-icon-color.svg',
      healthScore: 'healthy',
      technicalInfluence: 'contributing',
      activityCount: 28400,
      contributorCount: 528,
    },
    {
      projectSlug: 'cilium',
      projectName: 'Cilium',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/cilium/icon/color/cilium-icon-color.svg',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 31200,
      contributorCount: 490,
    },
    {
      projectSlug: 'open-telemetry',
      projectName: 'OpenTelemetry',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/opentelemetry/icon/color/opentelemetry-icon-color.svg',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 34500,
      contributorCount: 501,
    },
    {
      projectSlug: 'grpc',
      projectName: 'gRPC',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/grpc/icon/color/grpc-icon-color.svg',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 22800,
      contributorCount: 459,
    },
    {
      projectSlug: 'prometheus',
      projectName: 'Prometheus',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/prometheus/icon/color/prometheus-icon-color.svg',
      healthScore: 'excellent',
      technicalInfluence: 'contributing',
      activityCount: 26100,
      contributorCount: 471,
    },
    {
      projectSlug: 'containerd',
      projectName: 'containerd',
      projectLogo:
        'https://raw.githubusercontent.com/cncf/artwork/main/projects/containerd/icon/color/containerd-icon-color.svg',
      healthScore: 'healthy',
      technicalInfluence: 'contributing',
      activityCount: 19800,
      contributorCount: 461,
    },
    {
      projectSlug: 'tensorflow',
      projectName: 'TensorFlow',
      projectLogo:
        'https://raw.githubusercontent.com/github/explore/main/topics/tensorflow/tensorflow.png',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 28900,
      contributorCount: 466,
    },
    {
      projectSlug: 'flutter',
      projectName: 'Flutter',
      projectLogo:
        'https://raw.githubusercontent.com/github/explore/main/topics/flutter/flutter.png',
      healthScore: 'excellent',
      technicalInfluence: 'leading',
      activityCount: 24300,
      contributorCount: 465,
    },
    {
      projectSlug: 'angular',
      projectName: 'Angular',
      projectLogo:
        'https://raw.githubusercontent.com/github/explore/main/topics/angular/angular.png',
      healthScore: 'healthy',
      technicalInfluence: 'participating',
      activityCount: 18500,
      contributorCount: 457,
    },
    {
      projectSlug: 'bazel',
      projectName: 'Bazel',
      projectLogo: 'https://raw.githubusercontent.com/github/explore/main/topics/bazel/bazel.png',
      healthScore: 'growing',
      technicalInfluence: 'leading',
      activityCount: 12800,
      contributorCount: 456,
    },
  ],
};
