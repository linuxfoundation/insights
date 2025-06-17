// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getSearchVolume } from './keywords-everywhere.js';
import { closeDatabase, persistSearchVolume } from './database.js';
import { fetchFromTinybird } from './tinybird.js';

interface Project {
  id: string;
  slug: string;
  isLF?: boolean;
  rank?: number;
}

interface SearchVolumeResult {
  web_term: string | null;
  search_volume_trend: Array<{
    month: string;
    year: number;
    value: number;
  }>;
}

interface KEResults {
  [projectId: string]: SearchVolumeResult;
}

interface GetSearchVolumeOptions {
  keyword?: string;
  limit?: number;
  batchSize?: number;
}

interface KeywordPreparationResult {
  keywordsToFetch: string[];
  keywordToProjectMap: { [keyword: string]: string[] };
}

async function countProjectsInTinybird(): Promise<number> {
  const res = await fetchFromTinybird<{ 'count(id)': number }[]>('/v0/pipes/projects_list.json', {
    count: true,
  });

  return res.data[0]?.['count(id)'] || 0;
}

async function getProjectsFromTinybird(page: number, pageSize: number): Promise<Project[]> {
  const res = await fetchFromTinybird<any[]>('/v0/pipes/projects_list.json', {
    count: false,
    page: page,
    pageSize: pageSize,
  });

  return res.data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    isLF: p.isLF ?? false,
    rank: p.rank ?? undefined,
  }));
}

/**
 * Returns a list of projects filtered by the provided options for limit and keywords.
 * If a keyword is provided, it filters projects by that keyword.
 * If a limit is provided, it filters N internal and the top N external projects by rank.
 */
async function filterProjects(options: GetSearchVolumeOptions, projects: Project[]): Promise<Project[]> {
  const { keyword, limit } = options;

  if (keyword) {
    const filtered = projects.filter(p => p.slug === keyword);

    if (filtered.length === 0) {
      console.warn(`Warning: No projects found with slug '${keyword}'.`);
    }

    return filtered;
  }

  if (limit) {
    const internalProjects = projects
      .filter(p => p.isLF)
      .slice(0, limit);
    const externalProjects = projects
      .filter(p => !p.isLF)
      .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity))
      .slice(0, limit);

    return [...internalProjects, ...externalProjects];
  }

  return [...projects];
}

function prepareKeywords(projects: Project[]): KeywordPreparationResult {
  const keywordsToFetch: string[] = [];
  const keywordToProjectMap: { [keyword: string]: string[] } = {};

  for (const project of projects) {
    const projectId = project.id;
    const projectSlug = project.slug;

    if (!projectSlug || projectSlug.trim() === '') {
      console.warn(`Warning: Skipping project ${projectId} because it has a missing or empty slug.`);
      continue;
    }

    if (!(projectSlug in keywordToProjectMap)) {
      keywordsToFetch.push(projectSlug);
      keywordToProjectMap[projectSlug] = [];
    }
    keywordToProjectMap[projectSlug].push(projectId);
  }

  return { keywordsToFetch, keywordToProjectMap };
}

async function getSearchVolumeFromKE(keywords: string[], keywordToProjectMap: { [keyword: string]: string[] }): Promise<KEResults> {

  const apiResponse = await getSearchVolume(keywords);

  if (!apiResponse || !apiResponse.data) {
    console.log('Failed to get data from Keywords Everywhere API. Returning current results (mostly empty).');
    return {};
  }

  console.log('Processing API response...');
  const apiDataMap: { [keyword: string]: any[] } = {};

  for (const item of apiResponse.data) {
    if (item.keyword && item.trend) {
      apiDataMap[item.keyword] = item.trend;
    }
  }

  const results: KEResults = {};

  for (const [keyword, trendData] of Object.entries(apiDataMap)) {
    if (keyword in keywordToProjectMap) {
      try {
        trendData.sort((a, b) => {
          const yearDiff = parseInt(a.year) - parseInt(b.year);
          if (yearDiff !== 0) return yearDiff;

          const monthA = new Date(`${a.month} 1, 2000`).getMonth();
          const monthB = new Date(`${b.month} 1, 2000`).getMonth();
          return monthA - monthB;
        });
      } catch (error) {
        console.log(`Warning: Could not sort trend data for keyword '${keyword}'. Proceeding with original order.`);
      }

      for (const projectId of keywordToProjectMap[keyword]) {
        results[projectId] = {
          web_term: keyword,
          search_volume_trend: trendData
        };
      }
    } else {
      console.log(`Warning: API returned data for keyword '${keyword}' which was not in our original request map.`);
    }
  }

  return results;
}

async function saveResultsToDatabase(data: KEResults): Promise<void> {
  const records = [];
  
  for (const [projectId, result] of Object.entries(data)) {
    if (result.web_term && result.search_volume_trend.length > 0) {
      for (const trend of result.search_volume_trend) {
        // Convert month name and year to YYYY-MM-01 format
        const monthNumber = (new Date(`${trend.month} 1, 2000`).getMonth() + 1).toString().padStart(2, '0');
        const dataTimestamp = `${trend.year}-${monthNumber}-01`;
        records.push({
          insightsProjectId: projectId,
          slug: result.web_term,
          dataTimestamp,
          volume: trend.value
        });
      }
    }
  }
  
  if (records.length > 0) {
    await persistSearchVolume(records);
  } else {
    console.log('No search volume data to save to database');
  }
}

async function main() {
  const options: GetSearchVolumeOptions = {
    limit: 1000,
    batchSize: 1000 // Default batch size
  }

  const batchSize = options.batchSize ?? 100;
  let page = 0;
  let totalProcessed = 0;

  try {
    const totalProjects = await countProjectsInTinybird();
    console.log(`Total projects in Tinybird: ${totalProjects}`);

    while (true) {
      const projects = await getProjectsFromTinybird(page, batchSize);
      if (!projects || projects.length === 0) {
        break;
      }
      const selectedProjects = await filterProjects(options, projects);
      console.log(`Batch ${page + 1}: Selected ${selectedProjects.length} projects for search volume analysis.`);

      const { keywordsToFetch, keywordToProjectMap } = prepareKeywords(selectedProjects);
      const results = await getSearchVolumeFromKE(keywordsToFetch, keywordToProjectMap);
      console.log(`Batch ${page + 1}: Processed ${Object.keys(results).length} projects`);

      console.log('\n=== Saving results to database ===');
      await saveResultsToDatabase(results);
      totalProcessed += selectedProjects.length;
      if (selectedProjects.length < batchSize) {
        break; // If we processed less than a full batch, we must be at the end
      }
      page++;
    }

    console.log(`\n=== Process complete ===`);
    console.log(`Total projects processed: ${totalProcessed}`);
  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    await closeDatabase();
  }
}

export { main };

console.log("Starting main execution...");
main().catch(console.error);
