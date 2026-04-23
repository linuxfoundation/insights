// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchAgenticProjectsList } from '~~/server/data/tinybird/report/agentic-ai-momentum';
import type {
  AgenticDataResponse,
  AgenticProject,
  GitHubReleasesData,
  AgenticEnrichedProject,
} from '~~/types/report/agentic-ai-momentum.types';

const SECONDS_PER_DAY = 86400;

function secToDays(v: number | null): number | null {
  return v != null ? v / SECONDS_PER_DAY : null;
}

function pctToDecimal(v: number | null): number | null {
  return v != null ? v / 100 : null;
}

export default defineEventHandler(async (event): Promise<AgenticEnrichedProject[]> => {
  try {
    const { origin } = getRequestURL(event);

    const [tbProjects, projectsJson, releasesJson] = await Promise.all([
      fetchAgenticProjectsList(),
      $fetch<AgenticDataResponse<AgenticProject>>('/data/agentic-ai-momentum/projects.json', {
        baseURL: origin,
      }),
      $fetch<AgenticDataResponse<GitHubReleasesData>>(
        '/data/agentic-ai-momentum/github_releases_count.json',
        { baseURL: origin },
      ),
    ]);

    // Build lookup: normalized github URL -> project metadata
    const projectMetaByUrl = new Map<string, AgenticProject>();
    for (const p of projectsJson.data) {
      if (p.github_url) {
        projectMetaByUrl.set(normalizeUrl(p.github_url), p);
      }
    }

    // Build lookup: normalized github URL -> latest release count + delta
    const releasesByUrl = new Map<string, { latest: number | null; delta: number | null }>();
    const repoUrls = [...new Set(releasesJson.data.map((d) => d.repo))];
    for (const repo of repoUrls) {
      const repoData = releasesJson.data
        .filter((d) => d.repo === repo)
        .sort((a, b) => b.month.localeCompare(a.month));
      const latestValue = repoData[0]?.cumulative_release_count ?? null;
      const prevValue = repoData[1]?.cumulative_release_count ?? null;
      const delta = latestValue !== null && prevValue !== null ? latestValue - prevValue : null;
      releasesByUrl.set(normalizeUrl(repo), { latest: latestValue, delta });
    }

    return tbProjects.map((p, index): AgenticEnrichedProject => {
      const normalizedUrl = normalizeUrl(p.github_repo_link);
      const meta = projectMetaByUrl.get(normalizedUrl);
      const releases = releasesByUrl.get(normalizedUrl);

      return {
        projectId: p.project_id,
        name: p.name,
        slug: p.slug,
        githubRepoLink: meta?.github_url_display ?? p.github_repo_link,
        layer: meta?.layer ?? '',
        rank: meta?.rank ?? index + 1,
        license: meta?.license ?? '',
        // All-time values
        stars: p.stars,
        forks: p.forks,
        downloads: p.downloads,
        dockerPulls: p.docker_pulls,
        dependentRepos: p.dependent_repos,
        dependentPackages: p.dependent_packages,
        commits: p.commits,
        contributors: p.contributors,
        newContributors30d: p.new_contributors_30d,
        mergeRate: pctToDecimal(p.merge_rate),
        prResolveTimeDays: secToDays(p.pr_resolve_time_seconds),
        issueCloseTimeDays: secToDays(p.issue_close_time_seconds),
        issueResponseTimeDays: secToDays(p.issue_response_time_seconds),
        noResponseIssues: p.no_response_issues,
        vulnerabilities: p.vulnerabilities,
        cocomoValue: p.cocomo_value,
        githubReleases: releases?.latest ?? null,
        // 30d delta values
        stars30d: p.stars_30d,
        forks30d: p.forks_30d,
        downloads30d: p.downloads_30d,
        dockerPulls30d: p.docker_pulls_30d,
        commits30d: p.commits_30d,
        contributors30d: p.contributors_30d,
        mergeRate30d: pctToDecimal(p.merge_rate_30d),
        prResolveTimeDays30d: secToDays(p.pr_resolve_time_seconds_30d),
        issueCloseTimeDays30d: secToDays(p.issue_close_time_seconds_30d),
        issueResponseTimeDays30d: secToDays(p.issue_response_time_seconds_30d),
        noResponseIssues30d: p.no_response_issues_30d,
        vulnerabilities30d: p.vulnerabilities_30d,
        githubReleases30d: releases?.delta ?? null,
      };
    });
  } catch (error: unknown) {
    console.error('[agentic-ai-momentum/projects] error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch agentic AI projects data',
    });
  }
});

function normalizeUrl(url: string): string {
  return url.toLowerCase().replace(/\/$/, '');
}
