// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import { getLifecycleDescription } from './health-breakdown-templates';

describe('getLifecycleDescription', () => {
  test('should return the inert description when lifecycle state is "inert"', () => {
    const result = getLifecycleDescription('inert', null);
    expect(result).toBe(
      'No commits or activity recorded in the past 18 months. The project appears inactive and may require maintenance attention.',
    );
  });

  test('should return the active description for active state', () => {
    const result = getLifecycleDescription('active', null);
    expect(result).toBe(
      'Consistent commits, responsive maintainers, regular releases, and healthy issue triage.',
    );
  });

  test('should return the default description for null or unrecognized state', () => {
    const result1 = getLifecycleDescription(null, null);
    const result2 = getLifecycleDescription('unknown-state', null);
    const defaultDescription =
      'No repository activity has been indexed for this project. Lifecycle state cannot be determined until a supported source platform is connected.';
    expect(result1).toBe(defaultDescription);
    expect(result2).toBe(defaultDescription);
  });

  test('should return the stable description for stable state', () => {
    const result = getLifecycleDescription('stable', null);
    expect(result).toBe(
      'Mature and deliberately low-activity. The maintainer is reachable and there are no open issues or vulnerabilities that require attention.',
    );
  });

  test('should return the archived description for archived state', () => {
    const result = getLifecycleDescription('archived', null);
    expect(result).toBe(
      'The repository has been explicitly archived. No further updates are expected and the project is no longer accepting contributions.',
    );
  });
});
