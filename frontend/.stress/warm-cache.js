// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// warmup.js
import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org'
const topProjectsCount = 200
const topCollectionsCount = 100

const cacheCollections = true;
const cacheProjects = true;
const cacheOssIndex = true;

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
            `${baseUrl}/api/project?page=0&pageSize=${topProjectsCount}&sort=score_desc&onboarded=true&isLF=true`
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
    vus: 1,
    iterations: 1,
    duration: '1h'
};

export default function (paths) {
    paths.forEach((path, index) => {
        const url = `${baseUrl}${path}`;
        const res = http.get(url);
        if(res.status !== 200) {
            console.error(`Failed to warm up: ${url}`);
            return;
        }
        console.log(
            `${Math.round(((index + 1)/paths.length)*100)}% (${index + 1}/${paths.length})`,
            `Warmed up: ${url}`
        );
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
    })
}
