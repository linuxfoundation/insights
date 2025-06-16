// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
interface BaseLinkConfig {
  key: string;
  transformName?: (name: string) => string;
  transformUrl?: (url: string) => string;
}

export interface SocialLinkConfig extends BaseLinkConfig {
  domains: string[];
  img: string;
}

export interface WebsiteLinkConfig extends BaseLinkConfig {
  name: string;
  icon: string;
}

export interface DefaultLinkConfig extends BaseLinkConfig {
  icon: string;
}

export type LinkConfig = SocialLinkConfig | WebsiteLinkConfig | DefaultLinkConfig;

export interface DisplayLinkConfig {
  key: string;
  name: string;
  url: string;
  img?: string;
  icon: string;
}

export const socialLinkOrder = ['website', 'github', 'linkedin', 'twitter', 'default'];

export const socialLinkConfigs: Record<string, LinkConfig> = {
  twitter: {
    key: 'twitter',
    domains: ['x.com', 'twitter.com'],
    img: '/images/integrations/x.png',
    transformName: (name: string) => `@${name.replace(/^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/?/, '')}`,
    transformUrl: (url: string) => (url.startsWith('http') ? url : `https://${url}`)
  },
  linkedin: {
    key: 'linkedin',
    domains: ['linkedin.com'],
    img: '/images/integrations/linkedin.png',
    transformName: (name: string) => `/${name
      .replace(/^https?:\/\/(?:www\.)?linkedin\.com\/?/, '')
      .replace(/^company\//, '')
      .replace(/\/$/, '')}`,
    transformUrl: (url: string) => (url.startsWith('http') ? url : `https://${url}`)
  },
  github: {
    key: 'github',
    domains: ['github.com'],
    img: '/images/integrations/github.png',
    transformName: (name: string) => `/${name.replace(/^https?:\/\/(?:www\.)?github\.com\/?/, '')}`,
    transformUrl: (url: string) => (url.startsWith('http') ? url : `https://${url}`)
  },
  website: {
    key: 'website',
    name: 'Website',
    icon: 'link',
    transformName: (name: string) => name.replace(/^https?:\/\/(?:www\.)?/, '').replace(/\/$/, ''),
    transformUrl: (url: string) => (url.startsWith('http') ? url : `https://${url}`)
  },
  default: {
    key: 'default',
    icon: 'link'
  }
};
