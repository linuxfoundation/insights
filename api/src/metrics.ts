// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';

// Datadog bills custom metrics per tag combination, so tags stay low-cardinality and caller IDs
// ride on spans (ADR-0024). tracer.dogstatsd is read per call because init() replaces the no-op client.
type Tags = Record<string, string>;

const named = (metric: string) => `insights.api.${metric}`;

export function count(metric: string, tags: Tags): void {
  tracer.dogstatsd.increment(named(metric), 1, tags);
}

export function timing(metric: string, ms: number, tags: Tags): void {
  tracer.dogstatsd.distribution(named(metric), ms, tags);
}

export function gauge(metric: string, value: number, tags: Tags): void {
  tracer.dogstatsd.gauge(named(metric), value, tags);
}

export const statusClass = (statusCode: number) => `${Math.floor(statusCode / 100)}xx`;
