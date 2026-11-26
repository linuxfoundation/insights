// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, nextTick, reactive, ref } from 'vue';

import RepositorySearch from './repository-search.vue';
import RepositorySwitchItem from './repository-switch-item.vue';

const route = reactive<{
  name: string;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
}>({
  name: 'project-slug',
  params: { slug: 'demo' },
  query: {},
});

const push = vi.fn(
  (to: {
    name: string;
    params?: Record<string, string>;
    query: Record<string, string | undefined>;
  }) => {
    route.name = to.name;
    route.params = { slug: 'demo', ...to.params };
    route.query = to.query;
    return Promise.resolve();
  },
);

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: vi.fn((store) => store),
}));

const repos = Array.from({ length: 32 }, (_, i) => ({
  name: `repo-${i}`,
  slug: `repo-${i}`,
  url: `https://github.com/demo/repo-${i}`,
}));

vi.mock('~/components/modules/project/store/project.store', () => ({
  useProjectStore: () => ({
    selectedRepoSlugs: computed(() =>
      route.params.name ? [route.params.name] : route.query.repos?.split(',') || [],
    ),
    projectRepos: ref(repos),
    archivedRepos: ref([]),
    excludedRepos: ref([]),
    unavailableRepos: ref([]),
  }),
}));

// Render every row so the test can click any repository.
vi.mock('@vueuse/core', async (importOriginal) => {
  const { computed: vueComputed } = await import('vue');
  return {
    ...(await importOriginal<typeof import('@vueuse/core')>()),
    useVirtualList: (source: { value: unknown[] }) => ({
      list: vueComputed(() => source.value.map((data, index) => ({ data, index }))),
      containerProps: {},
      wrapperProps: {},
    }),
  };
});

const link = {
  key: 'overview',
  projectRouteName: 'project-slug',
  repoRouteName: 'project-slug-repository-name',
};

const render = () => mount(RepositorySearch, { props: { link } as never });

const rows = (wrapper: ReturnType<typeof render>) =>
  wrapper.findAllComponents(RepositorySwitchItem);

const clickRow = (wrapper: ReturnType<typeof render>, index: number) =>
  rows(wrapper).at(index)?.trigger('click');

describe('repository-search batching (OPS-1221)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockClear();
    route.name = 'project-slug';
    route.params = { slug: 'demo' };
    route.query = { repos: 'repo-0,repo-1' };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('rapid selections update checkboxes at once and the route once, after the pause', async () => {
    const wrapper = render();

    for (let i = 2; i < 32; i++) {
      await clickRow(wrapper, i);
      vi.advanceTimersByTime(100);
    }

    // fails before fix: every click pushed a route (30 pushes)
    expect(push).not.toHaveBeenCalled();
    expect(rows(wrapper).every((row) => (row.props() as { selected: boolean }).selected)).toBe(
      true,
    );

    vi.advanceTimersByTime(400);
    await nextTick();

    expect(push).toHaveBeenCalledTimes(1);
    expect(route.query.repos?.split(',')).toEqual(repos.map((r) => r.slug));
    expect(wrapper.emitted('close')).toBeUndefined();
  });

  test('keeps every selection and deselection made inside the window', async () => {
    const wrapper = render();

    await clickRow(wrapper, 5);
    await clickRow(wrapper, 6);
    await clickRow(wrapper, 0);
    await clickRow(wrapper, 5);
    vi.advanceTimersByTime(400);
    await nextTick();

    expect(push).toHaveBeenCalledTimes(1);
    expect(route.query.repos).toBe('repo-1,repo-6');
  });

  test('closing the modal flushes the pending selection', async () => {
    const wrapper = render();

    await clickRow(wrapper, 2);
    wrapper.unmount();

    expect(push).toHaveBeenCalledTimes(1);
    expect(route.query.repos).toBe('repo-0,repo-1,repo-2');
  });

  test('cancelPendingSelection drops the draft so "All repositories" wins', async () => {
    const wrapper = render();

    await clickRow(wrapper, 2);
    (wrapper.vm as unknown as { cancelPendingSelection: () => void }).cancelPendingSelection();
    wrapper.unmount();
    vi.advanceTimersByTime(400);

    expect(push).not.toHaveBeenCalled();
  });

  test('leaving one repository navigates to its page immediately and closes', async () => {
    const wrapper = render();

    await clickRow(wrapper, 0);

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toMatchObject({
      name: link.repoRouteName,
      params: { name: 'repo-1' },
    });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
