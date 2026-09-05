// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Safety net: if OG image generation fails for any unexpected reason
// (resvg crash, font issue, timeout, etc.), redirect to the default static image
// instead of returning a 500 to crawlers.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    if (!event?.path?.startsWith('/_og/')) return;

    // Detect timeout errors
    const isTimeout =
      error instanceof Error &&
      (error.message.includes('timeout') ||
        error.message.includes('Timeout') ||
        error.message.includes('AbortError'));

    const logData = {
      type: isTimeout ? 'og-image-render-timeout' : 'og-image-render-error',
      path: event.path,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      message: isTimeout ? 'OG image rendering timed out' : 'OG image rendering failed',
    };

    if (isTimeout) {
      console.warn(logData);
    } else {
      console.error(logData);
    }

    try {
      // Try to send redirect response
      // Use 302 (temporary) instead of 301 to signal this is a fallback
      await sendRedirect(event, '/og-image.png', 302);
    } catch (redirectError) {
      // Response may already be committed; log and continue
      console.warn({
        type: 'og-image-fallback-redirect-error',
        path: event.path,
        error: redirectError instanceof Error ? redirectError.message : String(redirectError),
        message: 'Could not redirect to fallback image',
      });
    }
  });
});
