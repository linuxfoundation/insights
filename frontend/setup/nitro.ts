// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Production runs on node:24-slim (Debian, glibc) — only the linux-x64-gnu native
// binary is ever loaded at runtime. Nitro's dependency tracer (nitropack >=2.13)
// full-traces every @resvg/resvg-js-* platform package it finds (Windows/macOS/
// Android/musl included), ballooning the server bundle from ~80MB to ~440MB.
// Known upstream issue: https://github.com/nuxt-modules/og-image/issues/412
export default {
  externals: {
    traceOptions: {
      ignore: [
        '**/node_modules/@resvg/resvg-js-android-arm-eabi/**',
        '**/node_modules/@resvg/resvg-js-android-arm64/**',
        '**/node_modules/@resvg/resvg-js-darwin-arm64/**',
        '**/node_modules/@resvg/resvg-js-darwin-x64/**',
        '**/node_modules/@resvg/resvg-js-linux-arm-gnueabihf/**',
        '**/node_modules/@resvg/resvg-js-linux-arm64-musl/**',
        '**/node_modules/@resvg/resvg-js-linux-x64-musl/**',
        '**/node_modules/@resvg/resvg-js-win32-arm64-msvc/**',
        '**/node_modules/@resvg/resvg-js-win32-ia32-msvc/**',
        '**/node_modules/@resvg/resvg-js-win32-x64-msvc/**',
      ],
    },
  },
};
