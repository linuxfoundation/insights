// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { flushPromises, mount } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import type { DocsReadinessCorrectionContext } from '~/components/modules/project/store/docs-readiness-correction.store';
import type { DocsCorrectionContext } from '~~/types/docs-readiness/correction.types';

import CorrectionModal from './correction-modal.vue';

const { mockFetchContext, mockSubmit, mockShowToast } = vi.hoisted(() => ({
  mockFetchContext: vi.fn(),
  mockSubmit: vi.fn(),
  mockShowToast: vi.fn(),
}));

vi.mock('~/components/modules/project/services/docs-readiness.api.service', () => ({
  DOCS_READINESS_API_SERVICE: {
    fetchCorrectionContext: mockFetchContext,
    submitCorrection: mockSubmit,
  },
}));

vi.mock('~/components/uikit/toast/toast.service', () => ({
  default: () => ({ showToast: mockShowToast }),
}));

vi.mock('~/components/uikit/modal/modal.vue', () => ({
  default: { name: 'LfxModal', template: '<div><slot /></div>' },
}));

vi.mock('~/components/uikit/button/button.vue', () => ({
  default: {
    name: 'LfxButton',
    props: ['disabled', 'loading'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}));

vi.mock('~/components/uikit/icon/icon.vue', () => ({
  default: { name: 'LfxIcon', template: '<i />' },
}));

vi.mock('~/components/uikit/icon-button/icon-button.vue', () => ({
  default: {
    name: 'LfxIconButton',
    template: '<button class="close-x" @click="$emit(\'click\')" />',
  },
}));

vi.mock('~/components/uikit/skeleton/skeleton.vue', () => ({
  default: { name: 'LfxSkeleton', template: '<div class="skeleton" />' },
}));

const openerContext: DocsReadinessCorrectionContext = {
  projectSlug: 'kubernetes',
  projectName: 'Kubernetes',
  currentDocsUrl: 'https://kubernetes.io/docs',
  state: 'scored',
};

const loaded: DocsCorrectionContext = {
  currentDocsUrl: 'https://kubernetes.io/docs',
  candidates: [
    { url: 'https://kubernetes.io/docs', method: 'docs-path', confidence: 'high', isCurrent: true },
    { url: 'https://k8s.dev', method: 'serp', confidence: 'low', isCurrent: false },
    {
      url: 'https://github.com/kubernetes/kubernetes',
      method: 'readme-scrape',
      confidence: 'medium',
      isCurrent: false,
    },
  ],
  override: null,
};

const setContext = (data: DocsCorrectionContext | undefined, isPending = false) =>
  mockFetchContext.mockReturnValue({ data: ref(data), isPending: ref(isPending) });

const mountModal = (context = openerContext) => mount(CorrectionModal, { props: { context } });

type Wrapper = ReturnType<typeof mountModal>;

const radios = (w: Wrapper) => w.findAll('input[type="radio"]');
const pick = async (w: Wrapper, index: number) => {
  await radios(w)[index]!.setValue(true);
  await flushPromises();
};
const submitButton = (w: Wrapper) =>
  w.findAll('button').find((b) => b.text() === 'Submit request')!;
const cancelButton = (w: Wrapper) => w.findAll('button').find((b) => b.text() === 'Cancel')!;
const typeUrl = async (w: Wrapper, value: string) => {
  await w.find('input[type="url"]').setValue(value);
  await flushPromises();
};

// With `loaded`: radios are [current, k8s.dev, other, none] (the GitHub candidate is hidden)
const OTHER_INDEX = 2;
const NONE_INDEX = 3;

beforeEach(() => {
  vi.clearAllMocks();
  setContext(loaded);
  mockSubmit.mockResolvedValue('https://github.com/linuxfoundation/insights/issues/7');
});

describe('correction-modal.vue', () => {
  test('lists candidates in order with method and confidence labels', () => {
    const text = mountModal().text();
    expect(text.indexOf('kubernetes.io/docs')).toBeLessThan(text.indexOf('k8s.dev'));
    expect(text).toContain('Found at a /docs path · High confidence');
    expect(text).toContain('Found via web search · Low confidence');
  });

  test('tags the current candidate as "Currently used"', () => {
    const text = mountModal().text();
    expect(text.match(/Currently used/g)).toHaveLength(1);
  });

  test('shows "None found" when there is no current URL', () => {
    setContext({ currentDocsUrl: null, candidates: [], override: null });
    const w = mountModal({ ...openerContext, currentDocsUrl: null, state: 'repo-only' });
    expect(w.text()).toContain('None found');
    expect(w.text()).not.toContain('Currently used');
  });

  test('always offers "A different URL" and "no documentation site"', () => {
    setContext({ currentDocsUrl: null, candidates: [], override: null });
    const w = mountModal();
    expect(w.text()).toContain('A different URL');
    expect(w.text()).toContain('The project has no documentation site');
  });

  test('still offers both when the context request fails', () => {
    setContext(undefined);
    const w = mountModal();
    expect(w.text()).toContain('A different URL');
    expect(w.text()).toContain('The project has no documentation site');
    expect(w.text()).toMatch(/Currently evaluated\s*kubernetes\.io\/docs/);
  });

  test('hides candidates that are repository links', () => {
    expect(mountModal().text()).not.toContain('github.com/kubernetes/kubernetes');
  });

  test('hides the no-docs option for a confirmed-no-docs project', () => {
    const w = mountModal({ ...openerContext, state: 'confirmed-no-docs' });
    expect(w.text()).not.toContain('The project has no documentation site');
  });

  test('submit is disabled until an option is picked', () => {
    expect(submitButton(mountModal()).attributes('disabled')).toBeDefined();
  });

  test('submit stays disabled and a hint shows when the current URL is picked', async () => {
    const w = mountModal();
    await pick(w, 0);
    expect(submitButton(w).attributes('disabled')).toBeDefined();
    expect(w.text()).toContain("That's the URL we already evaluate. Pick another option");
  });

  test('submit is enabled for another candidate and for "no documentation site"', async () => {
    const w = mountModal();
    await pick(w, 1);
    expect(submitButton(w).attributes('disabled')).toBeUndefined();
    await pick(w, NONE_INDEX);
    expect(submitButton(w).attributes('disabled')).toBeUndefined();
  });

  test('typing in the URL field selects "A different URL"', async () => {
    const w = mountModal();
    await typeUrl(w, 'https://k');
    expect((radios(w)[OTHER_INDEX]!.element as HTMLInputElement).checked).toBe(true);
  });

  test.each([
    ['no scheme', 'kubernetes.io/docs', 'Enter a full link, starting with https://'],
    ['repository link', 'https://github.com/kubernetes', "That's a code repository."],
    ['current URL', 'https://kubernetes.io/docs/', "That's the URL we already evaluate."],
  ])('shows the error for %s and keeps submit disabled', async (_name, value, message) => {
    const w = mountModal();
    await typeUrl(w, value);
    expect(w.text()).toContain(message);
    expect(submitButton(w).attributes('disabled')).toBeDefined();
  });

  test('enables submit for a valid custom URL', async () => {
    const w = mountModal();
    await typeUrl(w, 'https://docs.example.org');
    expect(submitButton(w).attributes('disabled')).toBeUndefined();
  });

  test('shows the description counter and caps input at 500', async () => {
    const w = mountModal();
    const textarea = w.find('textarea');
    expect(textarea.attributes('maxlength')).toBe('500');
    await textarea.setValue('hello');
    expect(w.text()).toContain('5 / 500');
  });

  test('submits the picked candidate with slug, page URL and description', async () => {
    const w = mountModal();
    await pick(w, 1);
    await w.find('textarea').setValue('moved');
    await submitButton(w).trigger('click');
    await flushPromises();

    expect(mockSubmit).toHaveBeenCalledWith({
      projectSlug: 'kubernetes',
      url: window.location.href,
      requestedDocsUrl: 'https://k8s.dev',
      description: 'moved',
    });
  });

  test('submits null for "no documentation site" and the trimmed custom URL for "A different URL"', async () => {
    const none = mountModal();
    await pick(none, NONE_INDEX);
    await submitButton(none).trigger('click');
    await flushPromises();
    expect(mockSubmit.mock.calls[0]![0].requestedDocsUrl).toBeNull();

    const custom = mountModal();
    await typeUrl(custom, '  https://docs.example.org  ');
    await submitButton(custom).trigger('click');
    await flushPromises();
    expect(mockSubmit.mock.calls[1]![0].requestedDocsUrl).toBe('https://docs.example.org');
  });

  test('closes and shows a toast with "View issue" on success', async () => {
    const w = mountModal();
    await pick(w, 1);
    await submitButton(w).trigger('click');
    await flushPromises();

    expect(w.emitted('close')).toHaveLength(1);
    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast.mock.calls[0]![4]).toMatchObject({
      actionLabel: 'View issue',
      actionUrl: 'https://github.com/linuxfoundation/insights/issues/7',
    });
  });

  test('shows the generic message, stays open and keeps the input on failure', async () => {
    mockSubmit.mockRejectedValue(new Error('500'));
    const w = mountModal();
    await typeUrl(w, 'https://docs.example.org');
    await w.find('textarea').setValue('note');
    await submitButton(w).trigger('click');
    await flushPromises();

    expect(w.text()).toContain("Correction requests aren't working at the moment.");
    expect(w.emitted('close')).toBeUndefined();
    expect(mockShowToast).not.toHaveBeenCalled();
    expect((w.find('input[type="url"]').element as HTMLInputElement).value).toBe(
      'https://docs.example.org',
    );
    expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('note');
  });

  test('clears the failure message on the next attempt', async () => {
    mockSubmit.mockRejectedValueOnce(new Error('500'));
    const w = mountModal();
    await pick(w, 1);
    await submitButton(w).trigger('click');
    await flushPromises();
    expect(w.text()).toContain("Correction requests aren't working");

    await submitButton(w).trigger('click');
    await flushPromises();
    expect(w.text()).not.toContain("Correction requests aren't working");
  });

  test('ignores a second click while sending', async () => {
    let resolve!: (url: string) => void;
    mockSubmit.mockReturnValue(new Promise<string>((r) => (resolve = r)));
    const w = mountModal();
    await pick(w, 1);
    await submitButton(w).trigger('click');
    await submitButton(w).trigger('click');
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    resolve('https://github.com/x/y/issues/1');
    await flushPromises();
  });

  test('emits close from Cancel', async () => {
    const w = mountModal();
    await cancelButton(w).trigger('click');
    expect(w.emitted('close')).toHaveLength(1);
  });
});
