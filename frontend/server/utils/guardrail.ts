// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { BedrockRuntimeClient, ApplyGuardrailCommand } from '@aws-sdk/client-bedrock-runtime';

interface GuardrailResult {
  blocked: boolean;
  field?: string;
  message?: string;
}

interface FieldInput {
  field: string;
  value: string;
}

function getClient(
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
): BedrockRuntimeClient {
  return new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

async function applyGuardrail(
  client: BedrockRuntimeClient,
  guardrailId: string,
  guardrailVersion: string,
  text: string,
): Promise<boolean> {
  const command = new ApplyGuardrailCommand({
    guardrailIdentifier: guardrailId,
    guardrailVersion,
    source: 'INPUT',
    content: [{ text: { text } }],
  });

  const response = await client.send(command);
  return response.action === 'NONE';
}

/**
 * Checks fields against AWS Bedrock Guardrails in two phases:
 * Phase 1 (word filter, free): screens for profanity
 * Phase 2 (content filter, paid): screens for hate, insults, sexual, violence, misconduct
 * Phase 2 only runs if Phase 1 passes.
 *
 * Reads guardrail configuration from runtime config automatically.
 */
export async function checkGuardrails(fields: FieldInput[]): Promise<GuardrailResult> {
  const runtimeConfig = useRuntimeConfig();
  const accessKeyId = runtimeConfig.awsBedrockAccessKeyId;
  const secretAccessKey = runtimeConfig.awsBedrockSecretAccessKey;
  const wordFilterGuardrailId = runtimeConfig.awsBedrockWordFilterGuardrailId;
  const contentFilterGuardrailId = runtimeConfig.awsBedrockContentFilterGuardrailId;
  const guardrailVersion = runtimeConfig.awsBedrockGuardrailVersion;
  const region = runtimeConfig.awsBedrockRegion;

  if (!wordFilterGuardrailId) {
    console.warn('Guardrail word filter ID not configured, skipping moderation checks');
    return { blocked: false };
  }

  const client = getClient(region, accessKeyId, secretAccessKey);

  // Phase 1: Word filter (free) - check all fields
  for (const { field, value } of fields) {
    if (!value) continue;

    const passed = await applyGuardrail(client, wordFilterGuardrailId, guardrailVersion, value);
    if (!passed) {
      return {
        blocked: true,
        field,
        message: `The ${field} contains inappropriate language. Please revise and try again.`,
      };
    }
  }

  // Phase 2: Content filter (paid) - only runs if Phase 1 passes
  if (!contentFilterGuardrailId) {
    console.warn('Guardrail content filter ID not configured, skipping content moderation');
    return { blocked: false };
  }

  for (const { field, value } of fields) {
    if (!value) continue;

    const passed = await applyGuardrail(client, contentFilterGuardrailId, guardrailVersion, value);
    if (!passed) {
      return {
        blocked: true,
        field,
        message: `The ${field} contains content that violates our guidelines. Please revise and try again.`,
      };
    }
  }

  return { blocked: false };
}
