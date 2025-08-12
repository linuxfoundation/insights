// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Linux Foundation and each contributor.

import type { AIMessage, MessageData, MessagePartType, MessageRole, MessageStatus } from "../types/copilot.types"
import type { CopilotParams } from '../types/copilot.types'
// import testData from './test.json'
import testData2 from './test2.json'
import type { Project } from '~~/types/project'

export const tempData = testData2 as AIMessage[];
class CopilotApiService {
  // Generate unique ID for messages
  generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  generateTextMessage = (message: string, role: MessageRole, status: MessageStatus) => {
    const userMessageId = this.generateId();
     
    return {
      id: userMessageId,
      role,
      type: 'text' as MessagePartType,
      status,
      content: message,
      timestamp: Date.now()
    }
  }

  async callChatStream(
    messages: Array<AIMessage>, 
    project: Project, 
    pipe: string, 
    parameters?: CopilotParams): Promise<Response> {
    // Prepare the request body with the correct format
    const requestBody = {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      pipe,
      segmentId: project?.id,
      projectName: project?.name,
      parameters
    }

    // Send streaming request
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response;
  }

  async callChartApi(
    sampleData: MessageData[]): Promise<Response> {
    // Prepare the request body with the correct format
    const requestBody = {
      results: sampleData,
      userQuery: 'Generate a chart for this data',
    }

    // Send streaming request
    const response = await fetch('/api/chat/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response;
  }
  
  async handleStreamingResponse(
    response: Response, 
    messages: Array<AIMessage>,
    statusCallBack: (status: string) => void,
    messageCallBack: (message: AIMessage, index: number) => void,
    completionCallBack: () => void
  ) {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (!reader) {
      throw new Error('No reader available')
    }

    let assistantContent = ''
    let assistantMessageId: string | null = null
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          try {
            // Parse AI SDK data stream format: "prefix:data"
            const colonIndex = line.indexOf(':')
            if (colonIndex === -1) continue
            
            const prefix = line.slice(0, colonIndex)
            const dataString = line.slice(colonIndex + 1)
            
            if (!dataString.trim()) continue
            
            // Handle different stream prefixes
            if (prefix === '2') {
              assistantMessageId = null;
              // Custom data events from your backend (like router-status)
              const dataArray = JSON.parse(dataString)
              for (const data of dataArray) {
                const statusText = this.getStatusText(data.type, data.status, data.reasoning, data.error);

                statusCallBack(statusText);

                if(data.type === 'router-status' && (data.status === 'complete' || data.status === 'error')) {
                  if (!assistantMessageId) {
                    assistantMessageId = this.generateId();
                  
                    messageCallBack({
                      id: assistantMessageId,
                      role: 'assistant',
                      type: 'router-status',
                      status: data.status,
                      content: data.reasoning,
                      timestamp: Date.now()
                    }, -1);
                  }
                }
                
                if (data.type === 'sql-result') {                  
                  // Create assistant message if it doesn't exist yet
                  if (!assistantMessageId) {
                    assistantMessageId = this.generateId();
                    messageCallBack({
                      id: assistantMessageId,
                      role: 'assistant',
                      type: 'sql-result',
                      status: data.status,
                      content: '',
                      timestamp: Date.now()
                    }, -1);
                  }
                  
                  // Format SQL results nicely
                  // const sqlSection = `## SQL Query\n\`\`\`sql\n${data.sql}\n\`\`\`\n\n`
                  // const explanationSection = `## Explanation\n${data.explanation}\n\n`
                  // const dataSection = `## Results\n\`\`\`json\n${JSON.stringify(data.data, null, 2)}\n\`\`\`\n\n`
                  
                  // assistantContent += sqlSection + explanationSection + dataSection
                  
                  const messageIndex = messages.findIndex(m => m.id === assistantMessageId)
                  if (messageIndex !== -1 && messages[messageIndex]) {
                    messageCallBack({
                      ...messages[messageIndex], 
                      content: data.explanation, 
                      sql: data.sql, 
                      data: data.data,
                      timestamp: Date.now()
                    }, messageIndex);
                  }
                } else if (data.type === 'pipe-result') {
                  statusCallBack('Tool execution completed');
                  
                  // Create assistant message if it doesn't exist yet
                  if (!assistantMessageId) {
                    assistantMessageId = this.generateId()
                    messageCallBack({
                      id: assistantMessageId,
                      role: 'assistant',
                      type: 'pipe-result',
                      status: data.status,
                      content: '',
                      timestamp: Date.now()
                    }, -1);
                  }
                  
                  // Format pipe results nicely
                  const toolsSection = `## Tools Used\n${data.tools.join(', ')}\n\n`
                  const explanationSection = `## Explanation\n${data.explanation}\n\n`
                  const dataSection = `## Results\n\`\`\`json\n${JSON.stringify(data.data, null, 2)}\n\`\`\`\n\n`
                  
                  assistantContent += toolsSection + explanationSection + dataSection
                  
                  const messageIndex = messages.findIndex(m => m.id === assistantMessageId)
                  if (messageIndex !== -1 && messages[messageIndex]) {
                    messageCallBack({...messages[messageIndex], content: assistantContent}, messageIndex);
                  }
                }
              }
            } else if (prefix === '0') {
              // Text delta from streamText (streaming text content)
              const textDelta = JSON.parse(dataString)
              
              // Create assistant message if it doesn't exist yet
              if (!assistantMessageId) {
                assistantMessageId = this.generateId()
                messageCallBack({
                  id: assistantMessageId,
                  role: 'assistant',
                  type: 'text',
                  status: 'analyzing',
                  content: '',
                  timestamp: Date.now()
                }, -1);
              }
              
              // Accumulate the streaming text
              assistantContent += textDelta
              
              // Update the assistant message in real-time
              const messageIndex = messages.findIndex(m => m.id === assistantMessageId)
              if (messageIndex !== -1 && messages[messageIndex]) {
                messageCallBack({...messages[messageIndex], content: assistantContent}, messageIndex);
              }
            // } else if (prefix === 'f') {
            //   // Final message metadata (message ID, etc.)
            //   const metadata = JSON.parse(dataString)
            //   console.log('Message metadata:', metadata)
            } else if (prefix === 'e') {
              // Stream end with completion info
              // const endData = JSON.parse(dataString)
              // console.log('Stream completed:', endData)
              statusCallBack('');
            // } else if (prefix === 'd') {
            //   // Final completion data
            //   const completionData = JSON.parse(dataString)
            //   console.log('Completion data:', completionData)
            }
          } catch (e) {
            console.warn('Failed to parse streaming line:', line, e)
          }
        }
      }
    } finally {
      reader.releaseLock()
      completionCallBack();
    }
  }

  getStatusText(type: string, status: string, reasoning: string, error: string): string {
    switch (type) {
      case 'router-status':
        return this.getStatusTextRouterStatus(status, reasoning, error)
      case 'sql-result':
        return 'SQL query executed successfully';
      case 'pipe-result':
        return 'Tool execution completed';
      default:
        return '';
    }
  }

  getStatusTextRouterStatus(status: string, reasoning: string, error: string): string {
    switch (status) {
      case 'analyzing':
        return 'Analyzing your question...';
      case 'complete':
        return reasoning ? `Analysis: ${reasoning}` : 'Analysis complete';
      default:
        return `Error: ${error || 'An error occurred'}`;
    }
  }
}

export const copilotApiService = new CopilotApiService();