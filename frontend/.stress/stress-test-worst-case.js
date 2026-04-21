// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
//
// Simulates a worst-case scenario: an aggressive crawler or targeted attack.
//
// No think time — each VU fires requests back-to-back across the full path
// space including expensive long time-range queries. This maximises fan-out
// pressure on Tinybird and exercises the adaptive semaphore at its limit.
//
// This test is intentionally destructive. Run against production only when
// you need to find the hard ceiling; otherwise use stress-test-normal.js.
//
// Run: k6 run stress-test-worst-case.js

import http from 'k6/http';
import { check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org';
const topProjectsCount = 200;
const topCollectionsCount = 200;

// All time ranges including the most expensive (full history scans)
const allTimeRanges = [
  'past90days',
  'past180days',
  'past365days',
  'previousQuarter',
  'previousYear',
  'previous5Year',
  'previous10Year',
  'alltime',
];

const ossIndexSort = ['totalContributors', 'softwareValue'];
const ossIndexType = ['horizontal', 'vertical'];

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  // No thresholds — this test is meant to find the breaking point
};

export function setup() {
  const allPaths = ['', '/collection', '/open-source-index'];

  const collectionsRequest = http.get(
    `${baseUrl}/api/collection?page=0&pageSize=${topCollectionsCount}&sort=starred_desc`,
  );
  const collections = JSON.parse(collectionsRequest.body)?.data || [];
  collections.forEach(({ slug }) => allPaths.push(`/collection/${slug}`));

  const projectRequest = http.get(
    `${baseUrl}/api/project?page=0&pageSize=${topProjectsCount}&sort=score_desc&onboarded=true&isLF=true`,
  );
  const projects = JSON.parse(projectRequest.body)?.data || [];
  projects.forEach(({ slug }) => {
    allPaths.push(`/project/${slug}`);
    allPaths.push(`/project/${slug}/security`);
    allTimeRanges.forEach((timeRange) => {
      allPaths.push(`/project/${slug}/contributors?timeRange=${timeRange}`);
      allPaths.push(`/project/${slug}/popularity?timeRange=${timeRange}`);
      allPaths.push(`/project/${slug}/development?timeRange=${timeRange}`);
    });
  });

  ossIndexSort.forEach((sort) =>
    ossIndexType.forEach((type) => allPaths.push(`/open-source-index?sort=${sort}&type=${type}`)),
  );

  return allPaths;
}

export default function (paths) {
  const path = paths[Math.floor(Math.random() * paths.length)];
  const res = http.get(`${baseUrl}${path}`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  // No sleep — back-to-back requests, simulating crawler / attack
}
