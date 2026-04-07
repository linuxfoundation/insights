// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Safety net: if OG image generation fails for any unexpected reason
// (resvg crash, font issue, etc.), redirect to the default static image
// instead of returning a 500 to crawlers.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    if (!event?.path?.startsWith('/__og-image__/')) return;
    console.warn(`OG image generation failed for ${event.path}:`, error);
    await sendRedirect(event, '/og-image.png', 302);
    // Mark as handled so h3 doesn't override the redirect with the error response
    event.handled = true;
  });
});
