// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DbStore } from "@crowd/database";
import {
  IInsightsProjectRepo,
  IPackageDownload,
  IPackageDownloadsRepo,
} from "../types";

export async function savePackagesDownloadForRepo(
  store: DbStore,
  packageDownload: IPackageDownload
) {
  // Save package downloads to the database
  await store.connection().query(
    `insert into package_downloads 
      (
        id, 
        date, 
        insights_project_id, 
        repository_url,
        name,
        ecosystem,
        purl,
        dependent_repos_count,
        dependent_packages_count,
        docker_dependents_count,
        docker_downloads_count,
        downloads_count,
        created_at,
        updated_at
      ) values 
      (
        $(id),
        $(date),
        $(insights_project_id),
        $(repository_url),
        $(name),
        $(ecosystem),
        $(purl),
        $(dependent_repos_count),
        $(dependent_packages_count),
        $(docker_dependents_count),
        $(docker_downloads_count),
        $(downloads_count),
        now(),
        now()
      )
      on conflict ("date", "repository_url", "name")
            do update
            set 
                "updated_at"                = EXCLUDED."updated_at",
                "dependent_repos_count"    = EXCLUDED."dependent_repos_count",
                "dependent_packages_count" = EXCLUDED."dependent_packages_count",
                "docker_dependents_count"  = EXCLUDED."docker_dependents_count",
                "docker_downloads_count"   = EXCLUDED."docker_downloads_count",
                "downloads_count"          = EXCLUDED."downloads_count"`,
    {
      id: packageDownload.id,
      date: packageDownload.date,
      insights_project_id: packageDownload.insights_project_id,
      repository_url: packageDownload.repository_url,
      name: packageDownload.name,
      ecosystem: packageDownload.ecosystem,
      purl: packageDownload.purl,
      dependent_repos_count: packageDownload.dependent_repos_count,
      dependent_packages_count: packageDownload.dependent_packages_count,
      docker_dependents_count: packageDownload.docker_dependents_count,
      docker_downloads_count: packageDownload.docker_downloads_count,
      downloads_count: packageDownload.downloads_count,
    }
  );
}

export async function findReposToProcessForDate(
  insightsDbStore: DbStore,
  cmDbStore: DbStore,
  date: string,
  failedRepos: string[],
  limit: number
): Promise<IInsightsProjectRepo[]> {
  // find last processed repo for the date
  const lastProcessedRepo: IPackageDownloadsRepo = await insightsDbStore
    .connection()
    .oneOrNone(
      `select repository_url from package_downloads
     where date = $(date)
     order by repository_url desc
     limit 1`,
      { date }
    );

  const lastProcessedRepoUrlFilter = lastProcessedRepo
    ? ` and "repoUrl"  > $(lastProcessedRepoUrl)`
    : "";

  const failedReposSubquery =
    failedRepos.length > 0
      ? 'and all_repos."repoUrl" not in ($(failedRepos:csv))'
      : "";

  const repos: IInsightsProjectRepo[] = await cmDbStore.connection().query(
    `
      with all_repos as (
            select
                id as "insightsProjectId",
                slug as "insightsProjectSlug",
                unnest(repositories) as "repoUrl"
            from "insightsProjects"
      )
      select distinct
          "insightsProjectId",
          "repoUrl"
      from all_repos
      where "repoUrl" like 'https://github.com%'
      ${failedReposSubquery}
      ${lastProcessedRepoUrlFilter}
      order by "repoUrl" asc
      limit $(limit)
    `,
    {
      lastProcessedRepoUrl: lastProcessedRepo
        ? lastProcessedRepo.repository_url
        : undefined,
      limit,
      failedRepos: failedRepos.length > 0 ? failedRepos : undefined,
    }
  );

  return repos;
}
