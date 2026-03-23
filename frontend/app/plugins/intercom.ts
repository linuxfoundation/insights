// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import { watch } from 'vue';
import { useAuth } from '~~/composables/useAuth';

declare global {
  interface Window {
    Intercom?: (...args: unknown[]) => void;
    intercomSettings?: Record<string, unknown>;
  }
}

export default defineNuxtPlugin(() => {
  if (process.server) return;

  const config = useRuntimeConfig();
  const intercomId = config.public.intercomId as string;
  const intercomApiBase = config.public.intercomApiBase as string;

  if (!intercomId) return;

  const { isAuthenticated, user } = useAuth();

  let isLoaded = false;
  let isLoading = false;
  let isBooted = false;
  let bootAttempted = false;

  const initializeStub = () => {
    const w = window as unknown as Window & {
      Intercom?: (...args: unknown[]) => void;
      [key: string]: unknown;
    };
    const ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      const i: ((...args: unknown[]) => void) & { q?: unknown[]; c?: (args: unknown) => void } = (
        ...args: unknown[]
      ) => {
        i.c?.(args);
      };
      i.q = [];
      i.c = (args: unknown) => {
        i.q?.push(args);
      };
      w.Intercom = i;
    }
  };

  const loadScript = () => {
    if (isLoaded || isLoading) return;
    isLoading = true;

    initializeStub();

    window.intercomSettings = {
      api_base: intercomApiBase,
      app_id: intercomId,
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${intercomId}`;
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
    };
    script.onerror = () => {
      isLoading = false;
    };

    const first = document.getElementsByTagName('script')[0];
    if (first?.parentNode) {
      first.parentNode.insertBefore(script, first);
    } else {
      document.head.appendChild(script);
    }
  };

  const boot = (intercomJwt: string, userId: string, name?: string, email?: string) => {
    if (isBooted) return;

    if (!isLoaded) {
      loadScript();
    }

    // Set JWT in intercomSettings before boot — required for identity verification
    window.intercomSettings = {
      ...window.intercomSettings,
      intercom_user_jwt: intercomJwt,
    };

    const pollInterval = setInterval(() => {
      if (isLoaded && window.Intercom) {
        clearInterval(pollInterval);
        clearTimeout(timeout);

        if (isBooted) return;
        isBooted = true;

        window.Intercom?.('boot', {
          api_base: intercomApiBase,
          app_id: intercomId,
          user_id: userId,
          name,
          email,
        });
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      isLoading = false;
      console.warn('[Intercom] Script failed to load within 10s');
    }, 10000);
  };

  const shutdown = () => {
    if (window.intercomSettings?.intercom_user_jwt) {
      delete window.intercomSettings.intercom_user_jwt;
    }
    if (window.Intercom && isBooted) {
      window.Intercom('shutdown');
      isBooted = false;
      bootAttempted = false;
    }
  };

  watch(
    [isAuthenticated, user],
    ([authenticated, currentUser]) => {
      if (authenticated && currentUser && !bootAttempted) {
        const { intercomJwt, username, name, email, sub } = currentUser;
        const userId = username || sub;

        if (userId && intercomJwt) {
          bootAttempted = true;
          boot(intercomJwt, userId, name, email);
        } else {
          console.warn('[Intercom] Not booted — missing userId or intercom JWT claim');
        }
      } else if (!authenticated && isBooted) {
        shutdown();
      }
    },
    { immediate: true },
  );
});
