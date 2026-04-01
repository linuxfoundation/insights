// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { EcosystemLayer } from '~~/types/report/agentic-ai-momentum.types';

export const LAYER_COLORS: Record<
  EcosystemLayer | string,
  { bg: string; text: string; border: string }
> = {
  'Protocols & Standards': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'Orchestration & Multi-Agent': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  'Personal & Coding Agents': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  'Computer Use & Browser Agents': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  'MCP Infrastructure': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  'Memory & Retrieval': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  'Tool Use & Integration': {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  'Evaluation & Observability': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  'Agent-Optimized Models': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  'Safety & Guardrails': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  'Developer Tooling & SDKs': {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  'Agent Infrastructure': {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  'Voice & Multimodal Agents': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  'Research & Vertical Agents': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
};

export function getLayerColors(layer: string) {
  return (
    LAYER_COLORS[layer] || {
      bg: 'bg-neutral-50',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
    }
  );
}

/** Returns inline CSS styles for a layer badge using hex colors (works regardless of Tailwind content scanning). */
export function getLayerBadgeStyle(layer: string): Record<string, string> {
  const hex = LAYER_HEX_COLORS[layer] || '#6B7280';
  return {
    backgroundColor: `${hex}1A`, // ~10% opacity tint
    color: hex,
    borderColor: `${hex}40`, // ~25% opacity border
  };
}

// Hex equivalents of the Tailwind color families above, for use in ECharts / canvas contexts
export const LAYER_HEX_COLORS: Record<string, string> = {
  'Protocols & Standards': '#3B82F6', // blue-500
  'Orchestration & Multi-Agent': '#8B5CF6', // violet-500
  'Personal & Coding Agents': '#10B981', // emerald-500
  'Computer Use & Browser Agents': '#F97316', // orange-500
  'MCP Infrastructure': '#06B6D4', // cyan-500
  'Memory & Retrieval': '#6366F1', // indigo-500
  'Tool Use & Integration': '#EC4899', // pink-500
  'Evaluation & Observability': '#EAB308', // yellow-500
  'Agent-Optimized Models': '#EF4444', // red-500
  'Safety & Guardrails': '#059669', // emerald-600
  'Developer Tooling & SDKs': '#64748B', // slate-500
  'Agent Infrastructure': '#7C3AED', // violet-600
  'Voice & Multimodal Agents': '#F59E0B', // amber-500
  'Research & Vertical Agents': '#14B8A6', // teal-400
};

export function getLayerHexColor(layer: string): string {
  return LAYER_HEX_COLORS[layer] || '#6B7280';
}

// Chart colors for research topics (ECharts compatible hex)
export const RESEARCH_TOPIC_COLORS: Record<string, string> = {
  autonomous_agents: '#3B82F6', // blue-500
  multi_agent_systems: '#8B5CF6', // violet-500
  llm_tool_use: '#F59E0B', // amber-500
  agent_memory_planning: '#10B981', // emerald-500
  agent_safety_alignment: '#EF4444', // red-500
  agentic_rag: '#06B6D4', // cyan-500
};

export const RESEARCH_TOPIC_LABELS: Record<string, string> = {
  autonomous_agents: 'Autonomous Agents',
  multi_agent_systems: 'Multi-Agent Systems',
  llm_tool_use: 'LLM Tool Use',
  agent_memory_planning: 'Agent Memory & Planning',
  agent_safety_alignment: 'Agent Safety & Alignment',
  agentic_rag: 'Agentic RAG',
};

export function getResearchTopicColor(topic: string): string {
  return RESEARCH_TOPIC_COLORS[topic] || '#6B7280';
}

export function getResearchTopicLabel(topic: string): string {
  return RESEARCH_TOPIC_LABELS[topic] || topic;
}
