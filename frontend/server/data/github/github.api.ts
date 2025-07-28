// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {useRuntimeConfig} from "#imports";

export async function createGitHubIssue(
    title: string,
    body: string,
) {
    const config = useRuntimeConfig();

    const {
        githubApiToken,
    } = config;

    if (!githubApiToken) {
        throw new Error('GitHub API Token is not defined');
    }


    const url = `https://api.github.com/repos/linuxfoundation/insights/issues`;
    const authorization = `token ${githubApiToken}`;

    return await $fetch(url, {
        method: 'POST',
        headers: {
            Authorization: authorization,
            Accept: 'application/vnd.github+json'
        },
        body: {
            title,
            body,
        }
    });
}
