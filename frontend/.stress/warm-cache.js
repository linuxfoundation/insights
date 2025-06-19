// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// warmup.js
import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'https://insights.linuxfoundation.org'
const topProjectsCount = 3

const basePaths = [
    '',
    '/collections',
    '/open-source-index'
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

export function setup() {
    const allPaths = [...basePaths];
    // Fetch top projects before test starts
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

    return allPaths;
}

export const options = {
    vus: 1,
    iterations: 1,
};

export default function (paths) {
    paths.forEach((path) => {
        const url = `${baseUrl}${path}`;
        const res = http.get(url);
        console.log(`Warmed up: ${url}`);
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
        sleep(0.5);
    })
}
