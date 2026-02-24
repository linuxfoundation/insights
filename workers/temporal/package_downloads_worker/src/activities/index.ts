// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import axios from "axios";
import { svc } from "../main";
import {
  findReposToProcessForDate,
  savePackageDownloadRun,
  savePackagesDownloadForRepo,
} from "../repo";
import { IInsightsProjectRepo, IPackageDownloadEcosystemsResponse } from "../types";


export async function fetchAndSavePackageDownloads(
  date: string,
  insightsProjectId: string,
  repoUrl: string
): Promise<boolean> {
  console.log(`Getting package downloads for ${repoUrl}`);

  let data: IPackageDownloadEcosystemsResponse[] = [];
  let bytesReturned = 0;
  let errorMessage: string | null = null;

  try {
    data = await fetchPackageDownloads(repoUrl);
    bytesReturned = data.length > 0 ? Buffer.byteLength(JSON.stringify(data)) : 0;
    console.log(`Got package downloads for ${repoUrl}`, data);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    console.log(`Failed getting package downloads for ${repoUrl}: ${errorMessage}`);
  }

  await savePackageDownloadRun(svc.insightsPostgres.writer, {
    date,
    insights_project_id: insightsProjectId,
    repository_url: repoUrl,
    bytes_returned: bytesReturned,
    returned_any_package_data: data.some(
      (pkg) =>
        pkg.dependent_repos_count != null ||
        pkg.dependent_packages_count != null ||
        pkg.docker_dependents_count != null ||
        pkg.docker_downloads_count != null ||
        pkg.downloads != null
    ),
    error: errorMessage,
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  if (data.length === 0) {
    console.log(`No package downloads found for ${repoUrl}`);
    return false;
  }

  for (const packageDownload of data) {
    await savePackagesDownloadForRepo(svc.insightsPostgres.writer, {
      ...packageDownload,
      date,
      insights_project_id: insightsProjectId,
      downloads_count: packageDownload.downloads,
    });
  }

  return true;
}

async function fetchPackageDownloads(
  repoUrl: string
): Promise<IPackageDownloadEcosystemsResponse[]> {
  console.log(`Getting package downloads for ${repoUrl}`);
  const url = `https://packages.ecosyste.ms/api/v1/packages/lookup?repository_url=${repoUrl}&mailto=insights@linuxfoundation.org`;
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const result = await axios(url, requestOptions);
    return result.data as IPackageDownloadEcosystemsResponse[];
  } catch (error) {
    console.log(`Failed getting package downloads!`);
    throw error;
  }
}

export async function fetchUnprocessedReposForDate(
  date: string,
  failedRepos: string[],
  limit: number
): Promise<IInsightsProjectRepo[]> {
  return findReposToProcessForDate(
    svc.insightsPostgres.reader,
    svc.cmPostgres.reader,
    date,
    failedRepos,
    limit
  );
}
