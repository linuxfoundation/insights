// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, test } from 'vitest';

import { lfxFooterMenu, visibleFooterLinks, type FooterMenuLink } from './footer';

const allLinks = () => lfxFooterMenu.flatMap((section) => section.links);

describe('footer menu', () => {
  test('links logged-in users to the API docs', () => {
    const insightsLinks = lfxFooterMenu.find((section) => section.title === 'LFX Insights')!.links;
    const visible = visibleFooterLinks(insightsLinks, true);

    expect(visible).toContainEqual(
      expect.objectContaining({ name: 'API docs', link: '/docs/api/' }),
    );
  });

  test('hides the API docs link from anonymous visitors', () => {
    for (const section of lfxFooterMenu) {
      const visible = visibleFooterLinks(section.links, false);
      expect(visible.some((link) => link.link?.startsWith('/docs/api'))).toBe(false);
    }
  });

  test('keeps every other link visible to anonymous visitors', () => {
    const publicLinks = allLinks().filter((link) => !link.link?.startsWith('/docs/api'));
    const visible = lfxFooterMenu.flatMap((section) => visibleFooterLinks(section.links, false));

    expect(visible).toEqual(publicLinks);
  });

  test('shows a login-only link once the user is logged in, in its original position', () => {
    const links: FooterMenuLink[] = [
      { name: 'First', link: '/a' },
      { name: 'Members', link: '/b', requiresAuth: true },
      { name: 'Last', link: '/c' },
    ];

    expect(visibleFooterLinks(links, true).map((link) => link.name)).toEqual([
      'First',
      'Members',
      'Last',
    ]);
    expect(visibleFooterLinks(links, false).map((link) => link.name)).toEqual(['First', 'Last']);
  });
});
