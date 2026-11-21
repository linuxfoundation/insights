// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { RouterConfig } from 'nuxt/schema';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { START_LOCATION, type RouteLocationNormalized } from 'vue-router';

import { useRouter } from '#app/composables/router';
import { useNuxtApp } from '#app/nuxt';

import routerOptions from './router.options';

const route = (path: string, hash = '', meta = {}) =>
  ({ path, hash, meta, fullPath: `${path}${hash}` }) as RouteLocationNormalized;

const scroll = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  saved: { left: number; top: number } | null = null,
) => routerOptions.scrollBehavior!(to, from, saved);

describe('router.options scrollBehavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (useRouter().options as Pick<RouterConfig, 'scrollBehaviorType'>).scrollBehaviorType;
  });

  test('same path and same hash keeps the position', () => {
    expect(scroll(route('/p', '#a'), route('/p', '#a'))).toBe(false);
  });

  test('same path with a new hash scrolls to the element', () => {
    expect(scroll(route('/p', '#b'), route('/p', '#a'))).toEqual({
      el: '#b',
      top: 0,
      behavior: 'auto',
    });
  });

  test('a new hash uses the router scrollBehaviorType', () => {
    (useRouter().options as Pick<RouterConfig, 'scrollBehaviorType'>).scrollBehaviorType = 'smooth';
    expect(scroll(route('/p', '#b'), route('/p'))).toMatchObject({ behavior: 'smooth' });
  });

  test('removing the hash scrolls to the top', () => {
    expect(scroll(route('/p'), route('/p', '#a'))).toEqual({ left: 0, top: 0 });
  });

  test('scrollToTop: false keeps the position', () => {
    expect(scroll(route('/q', '', { scrollToTop: false }), route('/p'))).toBe(false);
  });

  test('the first navigation returns the initial position', () => {
    expect(scroll(route('/p'), START_LOCATION)).toEqual({ left: 0, top: 0 });
    expect(scroll(route('/p'), START_LOCATION, { left: 0, top: 300 })).toEqual({
      left: 0,
      top: 300,
    });
    expect(scroll(route('/p', '#a'), START_LOCATION)).toEqual({
      el: '#a',
      top: 0,
      behavior: 'instant',
    });
  });

  test('a page change waits for page:loading:end, registered synchronously', () => {
    const hookOnce = vi.spyOn(useNuxtApp().hooks, 'hookOnce');
    scroll(route('/q'), route('/p'));
    expect(hookOnce).toHaveBeenCalledWith('page:loading:end', expect.any(Function));
  });
});
