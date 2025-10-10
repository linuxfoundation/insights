// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Linux Foundation and each contributor.

import type {
  AIMessage,
  MessageData,
  MessagePartType,
  MessageRole,
  MessageStatus,
} from '../types/copilot.types'
import type { CopilotParams } from '../types/copilot.types'
import type { Project } from '~~/types/project'

class CopilotApiService {
  // Generate unique ID for messages
  generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  generateTextMessage = (
    message: string,
    role: MessageRole,
    status: MessageStatus,
    type: MessagePartType = 'text',
  ) => {
    const userMessageId = this.generateId()

    return {
      id: userMessageId,
      role,
      type,
      status,
      content: message,
      timestamp: Date.now(),
    }
  }

  async callChatStream(
    messages: Array<AIMessage>,
    project: Project,
    pipe?: string,
    parameters?: CopilotParams,
    conversationId?: string,
  ): Promise<Response> {
    // Prepare the request body with the correct format
    const requestBody = {
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      pipe,
      projectSlug: project?.slug,
      projectName: project?.name,
      parameters,
      conversationId
    }
    // Send streaming request
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  async callChartApi(
    sampleData: MessageData[],
    conversationId?: string,
  ): Promise<Response> {
    // Prepare the request body with the correct format
    const requestBody = {
      results: sampleData,
      userQuery: 'Generate a chart for this data',
      conversationId,
    }

    // Send streaming request
    const response = await fetch('/api/chat/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  async saveFeedback(id: string, feedback: number | null): Promise<Response> {
    // Prepare the request body with the correct format
    const requestBody = {
      feedback,
    }

    // Send streaming request
    const response = await fetch(`/api/chat/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  async handleStreamingResponse(
    response: Response,
    messages: Array<AIMessage>,
    statusCallBack: (status: string) => void,
    messageCallBack: (message: AIMessage, index: number) => void,
    completionCallBack: (conversationId?: string) => void
  ): Promise<string | undefined> {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    let assistantContent = ''
    let assistantMessageId: string | null = null
    let conversationId: string | undefined = undefined
    let lineBuffer = '' // Buffer to accumulate partial lines

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Process any remaining data in the buffer
          if (lineBuffer.trim()) {
            this.processCompleteLine(
              lineBuffer,
              assistantMessageId,
              assistantContent,
              messages,
              statusCallBack,
              messageCallBack,
            )
          }
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        lineBuffer += chunk

        // Split by newlines and process complete lines
        const lines = lineBuffer.split('\n')

        // Keep the last line in the buffer (it might be incomplete)
        lineBuffer = lines.pop() || ''

        // Process all complete lines
        for (const line of lines) {
          if (line.trim() === '') continue

          const result = this.processCompleteLine(
            line,
            assistantMessageId,
            assistantContent,
            messages,
            statusCallBack,
            messageCallBack,
          )
          if (result) {
            assistantContent = result.assistantContent
            assistantMessageId = result.assistantMessageId
            if (result.conversationId) {
              conversationId = result.conversationId
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
      completionCallBack(conversationId);
    }
    
    return conversationId
  }

  private processCompleteLine(
    line: string,
    assistantMessageId: string | null,
    assistantContent: string,
    messages: Array<AIMessage>,
    statusCallBack: (status: string) => void,
    messageCallBack: (message: AIMessage, index: number) => void
  ): { assistantMessageId: string | null; assistantContent: string; conversationId?: string } | null {
    try {
      // Parse AI SDK data stream format: "prefix:data"
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return null

      const prefix = line.slice(0, colonIndex)
      const dataString = line.slice(colonIndex + 1)

      if (!dataString.trim()) return null

      // Handle different stream prefixes
      if (prefix === '2') {
        assistantMessageId = null;
        let capturedConversationId: string | undefined = undefined;
        
        // Custom data events from your backend (like router-status)
        const dataArray = JSON.parse(dataString)
        for (const data of dataArray) {
          const statusText = this.getStatusText(data.type, data.status, data.reasoning, data.error)

          statusCallBack(statusText)

          if (
            (data.type === 'router-status' || data.type === 'auditor-status') &&
            (
             data.status === 'complete' || 
             data.status === 'error' || 
             data.status === 'ask_clarification' || 
             data.status === 'validated' 
            )
          ) {
            if (!assistantMessageId) {
              assistantMessageId = this.generateId()

              let content: string
              if (data.status === 'ask_clarification') {
                content = data.question || 'I need more information to answer your question.'
              }
              else if (data.status === 'error') {
                content = data.error || 'An error occurred.'
              }
              else if (data.status === 'validated') {
                content = data.summary || 'Data validated successfully.'
              }
              else {
                content = data.reasoning || 'Analysis complete.'
              }

              messageCallBack(
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  type: 'router-status',
                  status: data.status,
                  content,
                  explanation: data.status === 'error' ? data.error : undefined,
                  routerReasoning: data.reasoning,
                  reformulatedQuestion: data.reformulatedQuestion,
                  question: data.question,
                  timestamp: Date.now(),
                },
                -1,
              )
            }
          }

          if (['sql-result', 'pipe-result', 'chat-response-id'].includes(data.type)) {
            if (data.type === 'pipe-result') {
              statusCallBack('Tool execution completed')
            }

            // Capture conversationId from chat-response-id for return
            if (data.type === 'chat-response-id' && data.conversationId) {
              capturedConversationId = data.conversationId;
            }

            const content = data.type === 'chat-response-id' ? data.id : data.explanation

            // Create assistant message if it doesn't exist yet
            if (!assistantMessageId) {
              assistantMessageId = this.generateId()
            }

            messageCallBack({
              id: assistantMessageId,
              role: 'assistant',
              type: data.type,
              status: data.status,
              sql: data.sql,
              data: data.data,
              content,
              explanation: data.explanation,
              instructions: data.instructions,
              conversationId: data.conversationId,
              chatResponseId: data.chatResponseId,
              timestamp: Date.now()
            }, -1);
          } 
        }
        
        return { assistantMessageId, assistantContent, conversationId: capturedConversationId }
      } else if (prefix === '0') {
        // Text delta from streamText (streaming text content)
        const textDelta = JSON.parse(dataString)

        // Create assistant message if it doesn't exist yet
        if (!assistantMessageId) {
          assistantMessageId = this.generateId()
          messageCallBack(
            {
              id: assistantMessageId,
              role: 'assistant',
              type: 'text',
              status: 'analyzing',
              content: '',
              timestamp: Date.now(),
            },
            -1,
          )
        }

        // Accumulate the streaming text
        assistantContent += textDelta

        // Update the assistant message in real-time
        const messageIndex = messages.findIndex((m) => m.id === assistantMessageId)
        if (messageIndex !== -1 && messages[messageIndex]) {
          messageCallBack({ ...messages[messageIndex], content: assistantContent }, messageIndex)
        }
        // } else if (prefix === 'f') {
        //   // Final message metadata (message ID, etc.)
        //   const metadata = JSON.parse(dataString)
        //   console.log('Message metadata:', metadata)
      } else if (prefix === 'e') {
        // Stream end with completion info
        // const endData = JSON.parse(dataString)
        // console.log('Stream completed:', endData)
        statusCallBack('')
        // } else if (prefix === 'd') {
        //   // Final completion data
        //   const completionData = JSON.parse(dataString)
        //   console.log('Completion data:', completionData)
      }

      return { assistantMessageId, assistantContent }
    } catch (e) {
      console.warn('Failed to parse streaming line:', line, e)
      return null
    }
  }

  getStatusText(type: string, status: string, reasoning: string, error: string): string {
    switch (type) {
      case 'router-status':
        return this.getStatusTextRouterStatus(status, reasoning, error)
      case 'auditor-status':
        return this.getStatusTextAuditorStatus(status, reasoning)
      case 'sql-result':
        return 'SQL query executed successfully'
      case 'pipe-result':
        return 'Tool execution completed'
      default:
        return ''
    }
  }

  getStatusTextRouterStatus(status: string, reasoning: string, error: string): string {
    switch (status) {
      case 'analyzing':
        return 'Analyzing your question...'
      case 'complete':
        return reasoning ? `Analysis: ${reasoning}` : 'Analysis complete'
      case 'ask_clarification':
        return reasoning || 'I need more information to answer your question.'
      default:
        return `Error: ${error || 'An error occurred'}`
    }
  }

  getStatusTextAuditorStatus(status: string, reasoning: string): string {
    switch (status) {
      case 'validating':
        return 'Validating data quality...'
      case 'validated':
        return reasoning ? `Validation passed: ${reasoning}` : 'Data validated successfully'
      case 'retrying':
        return 'Retrying with improved query...'
      case 'max_retries':
        return reasoning ? `Validation feedback: ${reasoning}` : 'Maximum validation attempts reached'
      default:
        return 'Validating...'
    }
  }
}

export const copilotApiService = new CopilotApiService()
