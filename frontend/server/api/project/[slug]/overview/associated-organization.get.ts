// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 * See responses.types.ts for the response format.
 */

import type { Organization } from '~~/types/contributors/responses.types'

/**
 * Query params:
 * - projectSlug: string
 */
export default defineEventHandler(async () => {
  const organization: Organization = {
    logo: 'https://avatars.githubusercontent.com/u/49998002?v=4',
    name: 'Cloud Native Computing Foundation',
    contributions: 100,
    website: 'https://www.cncf.io/',
    description:
      'Open-source organization under the Linux Foundation that promotes the adoption of cloud-native technologies',
    address: 'California, United States',
    employees: '1000+',
    organizationType: 'Public',
  }

  return organization
})
