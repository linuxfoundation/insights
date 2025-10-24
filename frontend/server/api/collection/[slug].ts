// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { Collection } from '~~/types/collection';

/**
 * API Endpoint: Fetch Collection Details by Slug
 *
 * Method: GET
 * URL: /api/collection/:slug
 *
 * Description:
 * This endpoint retrieves details of a specific collection identified by its slug.
 *
 * Request Parameters:
 * - slug (string) [URL Parameter]: The unique slug identifier for the collection.
 *
 * Response:
 * - 200 OK: Returns the details of the collection in the following structure:
 *   {
 *     id: string;
 *     name: string;
 *     slug: string;
 *     description: string;
 *     isLf: number;
 *     projectCount: number;
 *     featuredProjects: {
 *       name: string;
 *       slug: string;
 *       logo: string;
 *     }[];
 *   }
 *
 * - 404 Not Found: If the collection with the provided slug does not exist.
 *   {
 *     statusCode: 404;
 *     statusMessage: "Collection not found"
 *   }
 *
 * - 500 Internal Server Error: If an unexpected error occurs while processing the request.
 *   {
 *     statusCode: 500;
 *     statusMessage: "Internal server error"
 *   }
 */
export default defineEventHandler(async (event): Promise<Collection | Error> => {
  const { slug } = event.context.params as Record<string, string>;
  try {
    const res = await fetchFromTinybird<Collection[]>('/v0/pipes/collections_list.json', {
      slug,
    });
    if (!res.data || res.data.length === 0) {
      return createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }
    return res.data[0];
  } catch (err) {
    console.error('Error fetching collection details:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
