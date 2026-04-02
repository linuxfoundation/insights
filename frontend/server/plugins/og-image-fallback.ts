// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// When OG image generation fails (e.g. project slug no longer exists),
// redirect to the default static OG image instead of returning a 500.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (_error, { event }) => {
    if (!event?.path?.startsWith('/__og-image__/')) return;
    await sendRedirect(event, '/og-image.png', 302);
  });
});
