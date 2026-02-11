// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { isLocal } from './common';

const ALLOWED_REDIRECT_DOMAINS = isLocal
  ? ['linuxfoundation.org', 'auth0.com', 'localhost']
  : ['linuxfoundation.org', 'auth0.com'];
export const DEFAULT_REDIRECT = '/';

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities.
 * @param url - The URL to validate
 * @returns true if the URL is safe for redirect, false otherwise
 */
export function isValidRedirectUrl(url: string | undefined | null): boolean {
  // Reject empty/null/undefined
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return false;
  }

  // Reject protocol-relative URLs (//example.com) - these bypass same-origin checks
  if (trimmedUrl.startsWith('//')) {
    return false;
  }

  // Reject javascript:, data:, vbscript:, and other dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmedUrl.toLowerCase();
  if (dangerousProtocols.some((protocol) => lowerUrl.startsWith(protocol))) {
    return false;
  }

  // Allow relative URLs (starting with / but not //)
  if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
    // Additional check: reject URLs with encoded characters that could bypass validation
    // e.g., /%2F%2Fexample.com could decode to //example.com
    try {
      const decoded = decodeURIComponent(trimmedUrl);
      if (decoded.startsWith('//')) {
        return false;
      }
    } catch {
      // If decoding fails, reject to be safe
      return false;
    }
    return true;
  }

  // For absolute URLs, validate against allowed domains
  try {
    const parsedUrl = new URL(trimmedUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Check if hostname matches or is a subdomain of allowed domains
    const hostname = parsedUrl.hostname.toLowerCase();
    return ALLOWED_REDIRECT_DOMAINS.some((domain) => {
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    // If URL parsing fails, it's not a valid absolute URL
    // Could be a malformed URL or a relative path without leading slash
    // Reject to be safe
    return false;
  }
}

/**
 * Validates and sanitizes a redirect URL, returning a safe default if invalid.
 *
 * @param url - The URL to validate
 * @param fallback - Optional custom fallback URL (defaults to "/")
 * @returns The original URL if valid, otherwise the fallback
 */
export function getSafeRedirectUrl(
  url: string | undefined | null,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (isValidRedirectUrl(url)) {
    return url!.trim();
  }
  return fallback;
}
