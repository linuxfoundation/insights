// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Safety net: if OG image generation fails for any unexpected reason
// (resvg crash, font issue, timeout, etc.), redirect to the default static image
// instead of returning a 500 to crawlers.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    if (!event?.path?.startsWith('/__og-image__/')) return;

    // Detect timeout errors
    const isTimeout =
      error instanceof Error &&
      (error.message.includes('timeout') ||
        error.message.includes('Timeout') ||
        error.message.includes('AbortError'));

    const errorType = isTimeout ? 'TIMEOUT' : 'ERROR';
    const severity = isTimeout ? 'WARN' : 'ERROR';

    console[severity as 'warn' | 'error'](
      `[OG Image ${errorType}] ${event.path}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );

    // Also log to help with monitoring
    if (isTimeout) {
      console.warn(`[OG Image] Rendering took too long for path: ${event.path}`);
    }

    try {
      // Try to send redirect response
      // Use 302 (temporary) instead of 301 to signal this is a fallback
      await sendRedirect(event, '/og-image.png', 302);
    } catch (redirectError) {
      // Response may already be committed; log and continue
      console.warn(
        `[OG Image] Could not redirect to fallback for ${event.path}:`,
        redirectError instanceof Error ? redirectError.message : String(redirectError)
      );
    }
  });
});
