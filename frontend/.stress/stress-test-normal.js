// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
//
// Simulates normal organic user behaviour.
//
// Each VU browses at a human pace: 30–90s think time between pages.
// Requests are weighted toward the most common entry points (home,
// collection index, top project pages) rather than exhaustive time-range
// combinations.
//
// Run: k6 run stress-test-normal.js

import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org';

// Limit to top projects/collections — normal users don't visit long-tail pages
const topProjectsCount = 50;
const topCollectionsCount = 50;

// Normal users stick to default time range; sparse coverage of others
const commonTimeRanges = ['past90days', 'past365days', 'previousYear'];

const ossIndexSort = ['totalContributors', 'softwareValue'];
const ossIndexType = ['horizontal', 'vertical'];

export const options = {
  stages: [
    { duration: '30s', target: 40 },  // gentle ramp — morning traffic building
    { duration: '1m',  target: 40 },  // sustained normal load
    { duration: '30s', target: 80 },  // lunch / peak hours
    { duration: '1m',  target: 80 },
    { duration: '0s',  target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],           // <1% errors expected
    http_req_duration: ['p(95)<10000'],       // 95th percentile under 10s
  },
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
    commonTimeRanges.forEach((timeRange) => {
      allPaths.push(`/project/${slug}/contributors?timeRange=${timeRange}`);
      allPaths.push(`/project/${slug}/popularity?timeRange=${timeRange}`);
    });
  });

  ossIndexSort.forEach((sort) =>
    ossIndexType.forEach((type) =>
      allPaths.push(`/open-source-index?sort=${sort}&type=${type}`),
    ),
  );

  return allPaths;
}

export default function (paths) {
  const path = paths[Math.floor(Math.random() * paths.length)];
  const res = http.get(`${baseUrl}${path}`);
  check(res, { 'status is 200': (r) => r.status === 200 });

  // Human think time: 15–45s between page loads
  sleep(15 + Math.random() * 30);
}
