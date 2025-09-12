// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ofetch } from 'ofetch'
import type { PipeInstructions, TextToSqlInstructions } from './types'

// Function to execute a TinyBird pipe
async function executeTinybirdPipe(
  pipeName: string,
  parameters: Record<string, any>,
): Promise<any[]> {
  const tinybirdBaseUrl =
    process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co'
  const tinybirdToken = process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN

  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined')
  }

  // Build query string from parameters
  const params = new URLSearchParams(
    Object.entries(parameters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString()

  const url = params
    ? `${tinybirdBaseUrl}/v0/pipes/${pipeName}.json?${params}`
    : `${tinybirdBaseUrl}/v0/pipes/${pipeName}.json`

  try {
    const response = await ofetch(url, {
      headers: {
        Authorization: `Bearer ${tinybirdToken}`,
      },
    })

    // TinyBird response format has data array
    return response.data || []
  } catch (error) {
    console.error(`Error executing TinyBird pipe ${pipeName}:`, error)
    return []
  }
}

// Function to execute pipe instructions and combine results
export async function executePipeInstructions(instructions: PipeInstructions): Promise<any[]> {
  // Execute the pipes according to the instructions
  const pipeResults: Record<string, any[]> = {}

  // Execute each pipe with its inputs using TinyBird API
  for (const pipeInstruction of instructions.pipes) {
    try {
      const result = await executeTinybirdPipe(pipeInstruction.name, pipeInstruction.inputs)
      pipeResults[pipeInstruction.id] = result
    } catch (error) {
      console.error(`Error executing pipe ${pipeInstruction.name}:`, error)
      pipeResults[pipeInstruction.id] = []
    }
  }

  // Combine the results according to the output instructions
  const combinedData: any[] = []

  // Find the maximum number of rows across all pipes
  let maxRows = 0
  for (const pipeId of Object.keys(pipeResults)) {
    maxRows = Math.max(maxRows, pipeResults[pipeId]?.length || 0)
  }

  // Check if this is a date-based join (for time comparisons)
  const hasDateBasedJoin = instructions.output.some(
    (col) =>
      col.type === 'formula' &&
      col.dependencies.length > 1 &&
      col.dependencies.some(
        (dep) =>
          dep.sourceColumn.toLowerCase().includes('date') ||
          dep.sourceColumn.toLowerCase().includes('time'),
      ),
  )

  if (hasDateBasedJoin) {
    // Handle date-based joins for time comparisons (e.g., week-over-week)
    const primaryPipeId = instructions.output.find((col) => col.type === 'direct')?.pipeId
    if (primaryPipeId) {
      const primaryData = pipeResults[primaryPipeId] || []

      for (let i = 0; i < primaryData.length; i++) {
        const row: Record<string, any> = {}
        const primaryRow = primaryData[i]

        // Get the date from primary row for alignment
        const dateColumn = instructions.output.find(
          (col) => col.type === 'direct' && col.sourceColumn.toLowerCase().includes('date'),
        ) as { type: 'direct'; sourceColumn: string } | undefined
        const primaryDate = primaryRow[dateColumn?.sourceColumn || 'startDate']
        const primaryDateObj = new Date(primaryDate)

        for (const outputColumn of instructions.output) {
          if (outputColumn.type === 'direct') {
            // Direct column mapping from primary pipe
            if (outputColumn.pipeId === primaryPipeId) {
              row[outputColumn.name] = primaryRow[outputColumn.sourceColumn]
            } else {
              // For other pipes, find matching date
              const otherPipeData = pipeResults[outputColumn.pipeId] || []
              const matchingRow = otherPipeData.find((otherRow) => {
                const otherDate =
                  otherRow[
                    outputColumn.sourceColumn.toLowerCase().includes('date')
                      ? outputColumn.sourceColumn
                      : 'startDate'
                  ]
                const otherDateObj = new Date(otherDate)
                return otherDateObj.getDay() === primaryDateObj.getDay() // Match by day of week
              })
              row[outputColumn.name] = matchingRow ? matchingRow[outputColumn.sourceColumn] : null
            }
          } else if (outputColumn.type === 'formula') {
            // Formula column - compute value from dependencies with date alignment
            const variables: Record<string, any> = {}

            // Gather all dependency values with date alignment
            for (const dep of outputColumn.dependencies) {
              if (dep.pipeId === primaryPipeId) {
                // Use primary row data
                variables[dep.variable] = primaryRow[dep.sourceColumn]
              } else {
                // Find matching date in other pipe
                const otherPipeData = pipeResults[dep.pipeId] || []
                const matchingRow = otherPipeData.find((otherRow) => {
                  const otherDate =
                    otherRow['startDate'] || otherRow['date'] || Object.values(otherRow)[0]
                  const otherDateObj = new Date(otherDate)
                  return otherDateObj.getDay() === primaryDateObj.getDay() // Match by day of week
                })
                variables[dep.variable] = matchingRow ? matchingRow[dep.sourceColumn] : null
              }
            }

            // Evaluate the formula safely
            try {
              const formulaFunction = new Function(
                ...Object.keys(variables),
                `return ${outputColumn.formula}`,
              )
              row[outputColumn.name] = formulaFunction(...Object.values(variables))
            } catch (error) {
              console.error(`Error evaluating formula for column ${outputColumn.name}:`, error)
              row[outputColumn.name] = null
            }
          }
        }

        combinedData.push(row)
      }
    }
  } else {
    // Original row-by-row logic for non-date-based joins
    for (let i = 0; i < maxRows; i++) {
      const row: Record<string, any> = {}

      for (const outputColumn of instructions.output) {
        if (outputColumn.type === 'direct') {
          // Direct column mapping
          const pipeData = pipeResults[outputColumn.pipeId]
          if (pipeData && pipeData[i]) {
            row[outputColumn.name] = pipeData[i][outputColumn.sourceColumn]
          } else {
            row[outputColumn.name] = null
          }
        } else if (outputColumn.type === 'formula') {
          // Formula column - compute value from dependencies
          const variables: Record<string, any> = {}

          // Gather all dependency values
          for (const dep of outputColumn.dependencies) {
            const pipeData = pipeResults[dep.pipeId]
            if (pipeData && pipeData[i]) {
              variables[dep.variable] = pipeData[i][dep.sourceColumn]
            } else {
              variables[dep.variable] = null
            }
          }

          // Evaluate the formula safely
          try {
            // Create a function that has access only to the variables we provide
            const formulaFunction = new Function(
              ...Object.keys(variables),
              `return ${outputColumn.formula}`,
            )
            row[outputColumn.name] = formulaFunction(...Object.values(variables))
          } catch (error) {
            console.error(`Error evaluating formula for column ${outputColumn.name}:`, error)
            row[outputColumn.name] = null
          }
        }
      }

      combinedData.push(row)
    }
  }

  return combinedData
}

// Function to execute a SQL query via TinyBird's Query API
export async function executeTextToSqlInstructions(query: TextToSqlInstructions): Promise<any[]> {
  console.warn('🔍 executeTextToSqlInstructions called with query:', {
    queryType: typeof query,
    queryLength: query?.length || 0,
    queryPreview: query?.substring(0, 100) + (query?.length > 100 ? '...' : ''),
  })

  const tinybirdBaseUrl = process.env.NUXT_TINYBIRD_BASE_URL
  const tinybirdToken = process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN

  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined')
  }

  try {
    // Execute the SQL query via TinyBird's Query API
    // TinyBird expects the query as URL-encoded form data
    const params = new URLSearchParams()
    const finalQuery = `${query} FORMAT JSON`
    params.append('q', finalQuery)
    
    console.warn('📤 Executing TinyBird query:', {
      url: `${tinybirdBaseUrl}/v0/sql`,
      query: finalQuery.substring(0, 200) + (finalQuery.length > 200 ? '...' : ''),
    })

    const response = await ofetch(`${tinybirdBaseUrl}/v0/sql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tinybirdToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    console.warn('📥 TinyBird response:', {
      hasData: !!response.data,
      dataLength: response.data?.length || 0,
      responseKeys: Object.keys(response || {}),
    })

    // TinyBird SQL API response format has data array
    return response.data || []
  } catch (error: any) {
    console.error('❌ Error executing SQL query:', error)
    // Log more details about the error
    if (error.data) {
      console.error('Error response data:', error.data)
    }
    if (error.response) {
      console.error('Error response:', error.response)
    }
    throw error
  }
}
