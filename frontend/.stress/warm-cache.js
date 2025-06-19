// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// warmup.js
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
    vus: 3,
    duration: '10m'
};

let completed = false;

export default function (paths) {
    if(completed){
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
        if(res.status !== 200) {
            console.error(`VU ${__VU} - Error fetching ${url}: ${res.status} ${res.status_text}`);
            return;
        }
        console.log(
            `VU ${__VU} - (${index +1}/${userPaths.length}) - Warmed up: ${url}`
        );
        sleep(0.1);
    });
    completed = true;
}
