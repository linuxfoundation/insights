// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, nextTick, reactive, ref } from 'vue';

import RepositorySwitch from '../repository-switch.vue';
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

let navigationDelayMs = 0;

type Location = {
  name: string;
  params?: Record<string, string>;
  query: Record<string, string | undefined>;
};

const navigate = (to: Location) => {
  route.name = to.name;
  route.params = { slug: 'demo', ...to.params };
  route.query = to.query;
};

// A later push supersedes a pending one, like vue-router.
let pendingNavigation: ReturnType<typeof setTimeout> | undefined;
const push = vi.fn((to: Location) => {
  if (!navigationDelayMs) {
    navigate(to);
    return Promise.resolve();
  }
  clearTimeout(pendingNavigation);
  pendingNavigation = setTimeout(() => navigate(to), navigationDelayMs);
  return Promise.resolve();
});

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
    projectRepositoryGroups: ref([]),
    selectedRepositoryGroup: ref(null),
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

const isSelected = (row: { props: () => unknown } | undefined) =>
  (row?.props() as { selected?: boolean } | undefined)?.selected;

const clickRow = (wrapper: ReturnType<typeof render>, index: number) =>
  rows(wrapper).at(index)?.trigger('click');

describe('repository-search batching', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockClear();
    route.name = 'project-slug';
    route.params = { slug: 'demo' };
    route.query = { repos: 'repo-0,repo-1' };
  });

  afterEach(() => {
    vi.useRealTimers();
    navigationDelayMs = 0;
  });

  test('rapid selections update checkboxes at once and the route once, after the pause', async () => {
    const wrapper = render();

    for (let i = 2; i < 32; i++) {
      await clickRow(wrapper, i);
      vi.advanceTimersByTime(100);
    }

    expect(push).not.toHaveBeenCalled();
    expect(rows(wrapper).every((row) => isSelected(row))).toBe(true);

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

  test('leaving one repository opens its page after the pause and closes', async () => {
    const wrapper = render();

    await clickRow(wrapper, 0);
    expect(push).not.toHaveBeenCalled();

    await clickRow(wrapper, 2);
    await clickRow(wrapper, 2);
    vi.advanceTimersByTime(400);

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toMatchObject({
      name: link.repoRouteName,
      params: { name: 'repo-1' },
    });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  test('a route change from outside the modal drops the pending draft', async () => {
    const wrapper = render();

    await clickRow(wrapper, 2);
    route.query = { repos: 'repo-7,repo-8' };
    await nextTick();
    vi.advanceTimersByTime(400);

    expect(push).not.toHaveBeenCalled();
    expect(isSelected(rows(wrapper).at(7))).toBe(true);
    expect(isSelected(rows(wrapper).at(2))).toBe(false);
  });

  test('a click made while our own push is still navigating is kept', async () => {
    navigationDelayMs = 50;
    const wrapper = render();

    await clickRow(wrapper, 2);
    vi.advanceTimersByTime(400);
    await clickRow(wrapper, 3);
    vi.advanceTimersByTime(50);
    await nextTick();
    vi.advanceTimersByTime(450);

    expect(push).toHaveBeenCalledTimes(2);
    expect(route.query.repos).toBe('repo-0,repo-1,repo-2,repo-3');
  });

  test('a route change that keeps the repos, such as the date range, keeps the draft', async () => {
    const wrapper = render();

    await clickRow(wrapper, 2);
    route.query = { ...route.query, timeRange: 'past90days' };
    await nextTick();
    vi.advanceTimersByTime(400);

    expect(push).toHaveBeenCalledTimes(1);
    expect(route.query).toMatchObject({ repos: 'repo-0,repo-1,repo-2', timeRange: 'past90days' });
  });

  test('leaving the project with a pending draft does not navigate back', async () => {
    const wrapper = render();

    await clickRow(wrapper, 2);
    route.params = { slug: 'other' };
    route.query = { repos: 'repo-0,repo-1,repo-2' };
    wrapper.unmount();

    expect(push).not.toHaveBeenCalled();
  });
});

describe('repository-switch "All repositories" with a pending draft', () => {
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

  afterEach(() => {
    navigationDelayMs = 0;
  });

  const renderSwitch = () =>
    mount(RepositorySwitch, {
      props: { modelValue: true },
      global: {
        stubs: {
          LfxModal: { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' },
        },
      },
    });

  test('the "All repositories" row follows the draft, and choosing it wins over the draft', async () => {
    const wrapper = renderSwitch();
    const allRow = () => wrapper.findAllComponents(RepositorySwitchItem).at(0);
    const repoRows = () => wrapper.findAllComponents(RepositorySwitchItem).slice(1);

    await repoRows().at(0)?.trigger('click');
    await repoRows().at(1)?.trigger('click');
    expect(isSelected(allRow())).toBe(true);

    navigationDelayMs = 50;
    await repoRows().at(2)?.trigger('click');
    await allRow()?.trigger('click');
    await wrapper.setProps({ modelValue: false } as never);
    vi.advanceTimersByTime(400);

    expect(push).toHaveBeenCalledTimes(1);
    expect(route.query.repos).toBeUndefined();
  });
});
