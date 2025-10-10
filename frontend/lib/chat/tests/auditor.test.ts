// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auditor Agent Tests
 *
 * Tests auditor agent validation logic with statistical data summaries
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { createAmazonBedrock, type AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock'
import type { LanguageModelV1 } from 'ai'

import { AuditorAgent } from '../agents/auditor'
import { generateDataSummary } from '../utils/data-summary'
import type { ChatMessage } from '../types'

let bedrock: AmazonBedrockProvider | null = null

describe('Auditor Agent', () => {
  let model: LanguageModelV1

  beforeAll(async () => {
    // Check if we have the required environment variables
    const hasAwsCredentials = process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID

    if (!hasAwsCredentials) {
      console.warn('⚠️ Skipping auditor tests - missing AWS credentials')
      return
    }

    // Initialize AWS Bedrock model
    bedrock = createAmazonBedrock({
      accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
      secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
      region: process.env.NUXT_AWS_BEDROCK_REGION,
    })

    const BEDROCK_MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0'
    model = bedrock(BEDROCK_MODEL_ID)
  }, 30000)

  test('should validate data that answers the question correctly', async () => {
    if (!bedrock) {
      console.warn('⚠️ Skipping test - no AWS credentials')
      return
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: 'How many commits were made in January 2025?' },
    ]

    // Mock data that clearly answers the question
    const mockData = [
      { month: '2025-01', commit_count: 150 },
      { month: '2025-02', commit_count: 200 },
    ]

    const dataSummary = generateDataSummary(mockData)
    const agent = new AuditorAgent()

    const result = await agent.execute({
      model,
      messages,
      originalQuestion: 'How many commits were made in January 2025?',
      reformulatedQuestion: 'Get monthly commit counts for Q1 2025',
      dataSummary,
      attemptNumber: 0,
    })

    expect(result.is_valid).toBe(true)
    expect(result.summary).toBeDefined()
    expect(result.reasoning).toBeDefined()
  }, 30000)

  test('should invalidate data that does not answer the question', async () => {
    if (!bedrock) {
      console.warn('⚠️ Skipping test - no AWS credentials')
      return
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: 'What is the average response time for API endpoints?' },
    ]

    // Mock data that doesn't answer the question (commit data instead of API data)
    const mockData = [
      { author: 'john', commit_count: 50 },
      { author: 'jane', commit_count: 75 },
    ]

    const dataSummary = generateDataSummary(mockData)
    const agent = new AuditorAgent()

    const result = await agent.execute({
      model,
      messages,
      originalQuestion: 'What is the average response time for API endpoints?',
      reformulatedQuestion: 'Calculate average API response time across all endpoints',
      dataSummary,
      attemptNumber: 0,
    })

    expect(result.is_valid).toBe(false)
    expect(result.feedback_to_router).toBeDefined()
    expect(result.reasoning).toBeDefined()
  }, 30000)

  test('should generate efficient token-optimized data summary', () => {
    const mockData = [
      { date: '2025-01-01', commits: 10, lines_added: 500, lines_removed: 200 },
      { date: '2025-01-02', commits: 15, lines_added: 600, lines_removed: 150 },
      { date: '2025-01-03', commits: 8, lines_added: 300, lines_removed: 100 },
    ]

    const summary = generateDataSummary(mockData)

    expect(summary.rowCount).toBe(3)
    expect(summary.columns).toContain('commits')
    expect(summary.columns).toContain('lines_added')
    expect(summary.columnStats.commits).toBeDefined()
    expect(summary.columnStats.commits?.type).toBe('numeric')
    expect(summary.columnStats.commits?.min).toBe(8)
    expect(summary.columnStats.commits?.max).toBe(15)
    expect(summary.columnStats.commits?.avg).toBeDefined()
  })

  test('should handle empty data gracefully', async () => {
    if (!bedrock) {
      console.warn('⚠️ Skipping test - no AWS credentials')
      return
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: 'How many commits were made in January 2025?' },
    ]

    const emptyData: any[] = []
    const dataSummary = generateDataSummary(emptyData)
    const agent = new AuditorAgent()

    const result = await agent.execute({
      model,
      messages,
      originalQuestion: 'How many commits were made in January 2025?',
      reformulatedQuestion: 'Get monthly commit counts for Q1 2025',
      dataSummary,
      attemptNumber: 0,
    })

    expect(result.is_valid).toBe(false)
    expect(result.feedback_to_router).toBeDefined()
  }, 30000)

  test('should provide feedback for retry on second attempt', async () => {
    if (!bedrock) {
      console.warn('⚠️ Skipping test - no AWS credentials')
      return
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: 'What is the commit trend over time?' },
    ]

    // Mock data missing time dimension
    const mockData = [{ total_commits: 500 }]

    const dataSummary = generateDataSummary(mockData)
    const agent = new AuditorAgent()

    const previousFeedback =
      'The data lacks time dimension. Please group by date or month to show trends.'

    const result = await agent.execute({
      model,
      messages,
      originalQuestion: 'What is the commit trend over time?',
      reformulatedQuestion: 'Show commit activity trends grouped by month',
      dataSummary,
      attemptNumber: 1,
      previousFeedback,
    })

    expect(result.is_valid).toBe(false)
    expect(result.reasoning).toContain('time')
  }, 30000)
})
