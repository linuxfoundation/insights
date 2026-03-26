// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Node.js 22+ exposes `localStorage` as a global but requires --localstorage-file
// to function. Without it, the object exists but its methods (getItem, setItem, etc.)
// are undefined, causing SSR errors in packages like @vue/devtools-kit.
// This plugin replaces it with a no-op in-memory implementation on the server.
export default defineNitroPlugin(() => {
  if (typeof globalThis.localStorage?.getItem !== 'function') {
    const store = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    } as Storage;
  }
});
