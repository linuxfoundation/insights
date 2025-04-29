/**
 These are the types for the responses the frontend expects from the API for the popularity tab in the project page.
 */

import type { Summary } from '../shared/summary.types';

export interface StarsData {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    stars: number;
  }[];
}

export interface ForksData {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    forks: number;
  }[];
}

export interface MailingListsMessages {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    messages: number;
  }[];
}

export interface SocialMentions {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    twitter: number;
    reddit: number;
    hackerNews: number;
    stackOverflow: number;
  }[];
}

export interface GithubMentions {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    mentions: number;
  }[];
}

export interface SearchQueries {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    queryCount: number;
  }[];
}

export interface PressMention {
  thumbnail: string;
  title: string;
  url: string;
  date: string;
  description: string;
  source: string;
}

export interface PressMentions {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    mentions: number;
  }[];
  list: PressMention[];
}

export interface PackageDownloads {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    downloadCount: number;
  }[];
}
