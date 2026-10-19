// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { authState, isAuthReady } from '~~/composables/useAuth';

import LfxAuthLogin from './login.vue';

describe('login.vue before and after the initial auth check (OPS-839)', () => {
  beforeEach(() => {
    authState.value = { isAuthenticated: false, user: null };
    isAuthReady.value = false;
  });

  it('shows neither "Log in" nor the avatar until auth is ready, then "Log in" when unauthenticated', async () => {
    const wrapper = await mountSuspended(LfxAuthLogin);

    // fails before fix: "Log in" rendered immediately, even for users about to be authenticated
    expect(wrapper.text()).not.toContain('Log in');
    expect(wrapper.findComponent(LfxAvatar).exists()).toBe(false);

    isAuthReady.value = true;
    await nextTick();

    expect(wrapper.text()).toContain('Log in');
    expect(wrapper.findComponent(LfxAvatar).exists()).toBe(false);
  });
});
