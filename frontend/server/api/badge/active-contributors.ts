// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird'
import type { HealthScoreTinybird } from '~~/types/overview/responses.types'
import { formatNumberShort } from '~/components/shared/utils/formatter'

export default defineEventHandler(async (event): Promise<void> => {
  const query = getQuery(event)
  const project: string = query?.project as string
  const repos: string[] = (query?.repos as string)?.split(',') || undefined

  try {
    const res = await fetchFromTinybird<HealthScoreTinybird[]>(
      '/v0/pipes/health_score_active_contributors.json',
      {
        project,
        repos,
      },
    )
    if (!res.data || res.data.length === 0) {
      return
    }
    const activeContributors = res.data[0].activeContributors
    const label = encodeURIComponent('Active contributors (1Y)')
    const message = encodeURIComponent(formatNumberShort(activeContributors || 0))
    const url = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=0094FF&logo=linuxfoundation&logoColor=white&style=flat`

    return sendRedirect(event, url, 302)
  } catch (error) {
    console.error('Error fetching badge', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
