// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import axios from "axios";
import { svc } from "../main";
import {
  findReposToProcessForDate,
  savePackagesDownloadForRepo,
} from "../repo";
import { IInsightsProjectRepo, IPackageDownload, IPackageDownloadEcosystemsResponse } from "../types";

export async function testAct() {
  return 1;
}

export async function fetchAndSavePackageDownloads(
  date: string,
  insightsProjectId: string,
  repoUrl: string
): Promise<boolean> {
  console.log(`Getting package downloads for ${repoUrl}`);
  let data: IPackageDownloadEcosystemsResponse[] = await fetchPackageDownloads(repoUrl);
  console.log(`Got package downloads for ${repoUrl}`, data);

  if (!data || data.length === 0) {
    console.log(`No package downloads found for ${repoUrl}`);
    return false;
  }

  for (const packageDownload of data) {
    // Save package downloads to the database
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
