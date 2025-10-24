// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// warmup.js
import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org';
const topProjectsCount = 1000;
const topProjectsPage = 0;
const topCollectionsCount = 200;

const cacheCollections = false;
const cacheProjects = true;
const cacheOssIndex = false;

const basePaths = ['', '/collection', '/open-source-index'];

const collectionListSort = ['starred_desc', 'projectCount_desc', 'name_asc'];

const collectionDetailsTab = ['all', 'lfx'];

const collectionDetailsSort = [
  'name_asc',
  'contributorCount_desc',
  'organizationCount_desc',
  'score_desc',
];

const projectPaths = ['', '/security'];

const projectPathsWithTimeRanges = ['/contributors', '/popularity', '/development'];

const projectTimeRanges = [
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

export function setup() {
  const allPaths = [...basePaths];

  /* Collection */
  if (cacheCollections) {
    const categoryRequest = http.get(`${baseUrl}/api/category?pageSize=1000`);
    const categories = JSON.parse(categoryRequest.body)?.data || [];
    const categoryGroupIds = categories.map((categoryGroup) => categoryGroup.id);
    const categoryIds = categories
      .map((categoryGroup) => categoryGroup.categories.map((category) => category.id))
      .flat();

    const collectionsRequest = http.get(
      `${baseUrl}/api/collection?page=0&pageSize=${topCollectionsCount}&sort=starred_desc`,
    );
    const collections = JSON.parse(collectionsRequest.body)?.data || [];
    const collectionSlugs = collections.map((collection) => collection.slug);

    collectionListSort.forEach((slug) => {
      allPaths.push(`/collection?listSort=${slug}`);
    });

    categoryGroupIds.forEach((groupId) => {
      allPaths.push(`/collection?listCategory=group(${groupId})`);
      collectionListSort.forEach((slug) => {
        allPaths.push(`/collection?listSort=${slug}&listCategory=group(${groupId})`);
      });
    });

    categoryIds.forEach((id) => {
      allPaths.push(`/collection?listCategory=${id}`);
      collectionListSort.forEach((slug) => {
        allPaths.push(`/collection?listSort=${slug}&listCategory=${id}`);
      });
    });

    collectionSlugs.forEach((slug) => {
      allPaths.push(`/collection/${slug}`);
      collectionDetailsTab.forEach((tab) => {
        allPaths.push(`/collection/${slug}?collectionTab=${tab}`);
      });
      collectionDetailsSort.forEach((sort) => {
        allPaths.push(`/collection/${slug}?collectionSort=${sort}`);
      });
      collectionDetailsTab.forEach((tab) => {
        collectionDetailsSort.forEach((sort) => {
          allPaths.push(`/collection/${slug}?collectionTab=${tab}&collectionSort=${sort}`);
        });
      });
    });
  }

  /* Project */
  if (cacheProjects) {
    const projectRequest = http.get(
      `${baseUrl}/api/project?page=${topProjectsPage}&pageSize=${
        topProjectsCount
      }&sort=contributorCount_desc&onboarded=true`,
    );
    const projects = JSON.parse(projectRequest.body)?.data || [];
    const projectSlugs = projects.map((project) => project.slug);

    projectSlugs.forEach((slug) => {
      projectPaths.forEach((path) => {
        allPaths.push(`/project/${slug}${path}`);
      });
      projectPathsWithTimeRanges.forEach((path) => {
        projectTimeRanges.forEach((timeRange) => {
          allPaths.push(`/project/${slug}${path}?timeRange=${timeRange}`);
        });
      });
    });
  }

  /* Open Source Index */
  if (cacheOssIndex) {
    ossIndexSort.forEach((sort) => {
      ossIndexType.forEach((type) => {
        allPaths.push(`/open-source-index?sort=${sort}&type=${type}`);
      });
    });

    const ossGroupsRequestHorizontal = http.get(
      `${baseUrl}/api/ossindex/groups?sort=totalContributors&type=horizontal`,
    );

    const ossGroupsRequestVertical = http.get(
      `${baseUrl}/api/ossindex/groups?sort=totalContributors&type=vertical`,
    );
    const ossGroupsHorizontal = JSON.parse(ossGroupsRequestHorizontal.body) || [];
    const ossGroupsVertical = JSON.parse(ossGroupsRequestVertical.body) || [];
    const ossGroups = [...ossGroupsHorizontal, ...ossGroupsVertical];
    const ossGroupSlugs = ossGroups.map((group) => group.slug);
    ossGroupSlugs.forEach((slug) => {
      ossIndexSort.forEach((sort) => {
        allPaths.push(`/open-source-index/group/${slug}?sort=${sort}`);
      });

      const ossCategoriesRequest = http.get(
        `${baseUrl}/api/ossindex/categories?sort=totalContributors&categoryGroupSlug=${slug}`,
      );
      const ossCategories = JSON.parse(ossCategoriesRequest.body)?.categories || [];
      const ossCategorySlugs = ossCategories.map((category) => category.slug);
      ossCategorySlugs.forEach((categorySlug) => {
        ossIndexSort.forEach((sort) => {
          allPaths.push(`/open-source-index/category/${categorySlug}?sort=${sort}`);
        });
      });
    });
  }

  return allPaths;
}
const duration = 10;

export const options = {
  vus: 5,
  duration: `${duration}m`,
};

let completed = false;

export default function (paths) {
  if (completed) {
    sleep(duration * 60);
    return;
  }

  const vuIndex = __VU - 1;
  const totalVUs = __ENV.VUS ? parseInt(__ENV.VUS, 10) : options.vus;
  const chunkSize = Math.ceil(paths.length / totalVUs);
  const start = vuIndex * chunkSize;
  const end = Math.min(start + chunkSize, paths.length);

  const userPaths = paths.slice(start, end);

  userPaths.forEach((path, index) => {
    const url = `${baseUrl}${path}`;
    const res = http.get(url);

    check(res, {
      'status is 200': (r) => r.status === 200,
    });
    if (res.status !== 200) {
      console.error(`VU ${__VU} - Error fetching ${url}: ${res.status} ${res.status_text}`);
      return;
    }
    console.log(`VU ${__VU} - (${index + 1}/${userPaths.length}) - Warmed up: ${url}`);
    sleep(0.1);
  });
  completed = true;
}
