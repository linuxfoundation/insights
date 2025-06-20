// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org'
const topProjectsCount = 100
const topProjectsPage = 1
const topCollectionsCount = 200

const cacheCollections = false;
const cacheProjects = true;
const cacheOssIndex = false;

const basePaths = [
    '',
    '/collection',
    '/open-source-index',
];

const projectPaths = [
    '',
    '/security',
];

const projectPathsWithTimeRanges = [
    '/contributors',
    '/popularity',
    '/development',
];

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

const ossIndexSort = [
    'totalContributors',
    'softwareValue',
]

const ossIndexType = [
    'horizontal',
    'vertical',
];

export function setup() {
    const allPaths = [...basePaths];

    /* Collection */
    if(cacheCollections){
        const collectionsRequest = http.get(
            `${baseUrl}/api/collection?page=0&pageSize=${topCollectionsCount}&sort=starred_desc`
        );
        const collections = JSON.parse(collectionsRequest.body)?.data || [];
        const collectionSlugs = collections.map((collection) => collection.slug);

        collectionSlugs.forEach((slug) => {
            allPaths.push(`/collection/${slug}`);
        })
    }

    /* Project */
    if(cacheProjects){
        const projectRequest = http.get(
            `${baseUrl}/api/project?page=${topProjectsPage}&pageSize=${
                topProjectsCount}&sort=score_desc&onboarded=true&isLF=true`
        );
        const projects = JSON.parse(projectRequest.body)?.data || [];
        const projectSlugs = projects.map((project) => project.slug);

        projectSlugs.forEach((slug) => {
            projectPaths.forEach((path) => {
                allPaths.push(`/project/${slug}${path}`);
            })
            projectPathsWithTimeRanges.forEach((path) => {
                projectTimeRanges.forEach((timeRange) => {
                    allPaths.push(`/project/${slug}${path}?timeRange=${timeRange}`);
                })
            })
        })
    }

    /* Open Source Index */
    if(cacheOssIndex){
        ossIndexSort.forEach((sort) => {
            ossIndexType.forEach((type) => {
                allPaths.push(`/open-source-index?sort=${sort}&type=${type}`);
            })
        })
    }

    return allPaths;
}

export const options = {
    stages: [
        { duration: '10s', target: 500 },
        { duration: '20s', target: 500 },
        { duration: '20s', target: 0 },
    ],
};

export default function (paths) {
    const path = paths[Math.floor(Math.random() * paths.length)];
    const url = `${baseUrl}${path}`;
    const res = http.get(url);
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    sleep(1);
}
