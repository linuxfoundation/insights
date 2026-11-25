// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPinia, setActivePinia } from 'pinia';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { useDocsReadinessCorrectionStore } from './docs-readiness-correction.store';

const auth = vi.hoisted(() => ({ isAuthenticated: { value: false }, login: vi.fn() }));

// Mock useAuth itself: it returns a module-local login, so mocking the login export misses it
vi.mock('~~/composables/useAuth', () => ({ useAuth: () => auth }));

const context = {
  projectSlug: 'kubernetes',
  projectName: 'Kubernetes',
  currentDocsUrl: 'https://kubernetes.io/docs',
  state: 'scored',
} as const;

describe('docs readiness correction store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    auth.isAuthenticated.value = false;
    auth.login.mockClear();
  });

  test('starts closed with no context', () => {
    const store = useDocsReadinessCorrectionStore();
    expect(store.isCorrectionModalOpen).toBe(false);
    expect(store.correctionContext).toBeNull();
  });

  test('openCorrection opens with the given context when logged in', () => {
    auth.isAuthenticated.value = true;
    const store = useDocsReadinessCorrectionStore();

    store.openCorrection(context);

    expect(store.isCorrectionModalOpen).toBe(true);
    expect(store.correctionContext).toEqual(context);
    expect(auth.login).not.toHaveBeenCalled();
  });

  test('openCorrection sends a logged-out user to login with the current path, query and hash', () => {
    const store = useDocsReadinessCorrectionStore();

    store.openCorrection(context);

    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(auth.login).toHaveBeenCalledWith(
      window.location.pathname + window.location.search + window.location.hash,
    );
    expect(store.isCorrectionModalOpen).toBe(false);
    expect(store.correctionContext).toBeNull();
  });

  test('closeCorrection closes and clears the context', () => {
    auth.isAuthenticated.value = true;
    const store = useDocsReadinessCorrectionStore();
    store.openCorrection(context);

    store.closeCorrection();

    expect(store.isCorrectionModalOpen).toBe(false);
    expect(store.correctionContext).toBeNull();
  });

  test('openCorrection replaces the context of an earlier open', () => {
    auth.isAuthenticated.value = true;
    const store = useDocsReadinessCorrectionStore();
    const other = { ...context, projectSlug: 'envoy', projectName: 'Envoy' };

    store.openCorrection(context);
    store.openCorrection(other);

    expect(store.correctionContext).toEqual(other);
  });

  test('accepts a null currentDocsUrl', () => {
    auth.isAuthenticated.value = true;
    const store = useDocsReadinessCorrectionStore();
    const noDocs = { ...context, currentDocsUrl: null, state: 'no-docs' as const };

    store.openCorrection(noDocs);

    expect(store.correctionContext).toEqual(noDocs);
  });

  test('closing through the open ref keeps working', () => {
    auth.isAuthenticated.value = true;
    const store = useDocsReadinessCorrectionStore();
    store.openCorrection(context);

    store.isCorrectionModalOpen = false;
    const other = { ...context, projectSlug: 'envoy' };
    store.openCorrection(other);

    expect(store.isCorrectionModalOpen).toBe(true);
    expect(store.correctionContext).toEqual(other);
  });
});
