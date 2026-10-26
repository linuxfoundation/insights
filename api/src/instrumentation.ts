// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createRequire } from 'node:module';

import tracer from 'dd-trace';

import { loadLocalEnv } from './env.js';

// Preloaded with `node --import` (ADR-0024), since an ESM graph is linked before any of it runs and
// dd-trace must hook Fastify and pg before the app imports them.
loadLocalEnv();

// Off until a Datadog agent is configured, so local runs and tests send nothing.
if (process.env.DD_AGENT_HOST) {
  tracer.init({ service: process.env.DD_SERVICE ?? 'insights-api' });
  // Kubelet probes would otherwise make up most of the traces and skew endpoint latency.
  tracer.use('http', { server: { blocklist: /^\/health\// } });
  createRequire(import.meta.url)('dd-trace/register.js');
}
