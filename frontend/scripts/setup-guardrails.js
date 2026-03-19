// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * setup-guardrails.js
 *
 * Creates or updates two Amazon Bedrock Guardrails used for moderating
 * community collection names and descriptions:
 *
 *   1. Word filter (free) — screens for profanity on every request
 *   2. Content filter (paid) — screens for hate, insults, sexual content,
 *      violence, and misconduct. Only invoked when the word filter passes.
 *
 * Prerequisites:
 *   - AWS credentials with bedrock:CreateGuardrail and bedrock:UpdateGuardrail
 *     permissions in the target region.
 *
 * Usage:
 *   pnpm setup:guardrails
 *
 * Environment variables (reads from the same env vars used by the Nuxt app):
 *   NUXT_AWS_BEDROCK_ACCESS_KEY_ID       — AWS access key
 *   NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY    — AWS secret key
 *   NUXT_AWS_BEDROCK_REGION              — AWS region (default: us-east-1)
 *   NUXT_AWS_BEDROCK_WORD_FILTER_GUARDRAIL_ID     — existing word filter ID (for updates)
 *   NUXT_AWS_BEDROCK_CONTENT_FILTER_GUARDRAIL_ID  — existing content filter ID (for updates)
 *
 * After running, copy the printed guardrail IDs into your .env file.
 */

import {
  BedrockClient,
  CreateGuardrailCommand,
  UpdateGuardrailCommand,
} from '@aws-sdk/client-bedrock';

const region = process.env.NUXT_AWS_BEDROCK_REGION || 'us-east-1';
const accessKeyId = process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID;
const secretAccessKey = process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.error(
    'Error: NUXT_AWS_BEDROCK_ACCESS_KEY_ID and NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY must be set.',
  );
  process.exit(1);
}

const client = new BedrockClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

const SHARED = {
  blockedInputMessaging: 'Your input contains content that is not allowed.',
  blockedOutputsMessaging: 'The generated content was blocked.',
};

const wordFilterParams = {
  ...SHARED,
  name: 'collection-word-filter',
  description: 'Phase 1: Profanity word filter for collection names and descriptions.',
  wordPolicyConfig: {
    managedWordListsConfig: [{ type: 'PROFANITY' }],
  },
};

const contentFilterParams = {
  ...SHARED,
  name: 'collection-content-filter',
  description: 'Phase 2: Content filter for collection names and descriptions.',
  contentPolicyConfig: {
    filtersConfig: [
      { type: 'HATE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'INSULTS', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'SEXUAL', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'VIOLENCE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'MISCONDUCT', inputStrength: 'HIGH', outputStrength: 'HIGH' },
    ],
  },
};

async function createOrUpdate(params, existingId, envKey) {
  let response;
  if (existingId) {
    response = await client.send(
      new UpdateGuardrailCommand({
        guardrailIdentifier: existingId,
        ...params,
      }),
    );
    // eslint-disable-next-line no-console
    console.log(`Updated "${params.name}" — ID: ${response.guardrailId}`);
  } else {
    response = await client.send(new CreateGuardrailCommand(params));
    // eslint-disable-next-line no-console
    console.log(`Created "${params.name}" — ID: ${response.guardrailId}`);
  }
  // eslint-disable-next-line no-console
  console.log(`  Add to .env: ${envKey}=${response.guardrailId}`);
}

async function main() {
  // eslint-disable-next-line no-console
  console.log(`Setting up guardrails in region: ${region}\n`);

  await createOrUpdate(
    wordFilterParams,
    process.env.NUXT_AWS_BEDROCK_WORD_FILTER_GUARDRAIL_ID,
    'NUXT_AWS_BEDROCK_WORD_FILTER_GUARDRAIL_ID',
  );

  await createOrUpdate(
    contentFilterParams,
    process.env.NUXT_AWS_BEDROCK_CONTENT_FILTER_GUARDRAIL_ID,
    'NUXT_AWS_BEDROCK_CONTENT_FILTER_GUARDRAIL_ID',
  );

  // eslint-disable-next-line no-console
  console.log('\nDone! Add the guardrail IDs to your .env file.');
  // eslint-disable-next-line no-console
  console.log('Set NUXT_AWS_BEDROCK_GUARDRAIL_VERSION=DRAFT (or a published version number).');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
