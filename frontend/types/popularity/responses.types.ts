import type { Summary } from '../shared/summary.types';

export interface StarsData {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    stars: number;
  }[];
}

export interface ForksData {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    forks: number;
  }[];
}

export interface SocialMentions {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    twitter: number;
    reddit: number;
    hackerNews: number;
    stackOverflow: number;
  }[];
}

export interface GithubMentions {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    mentions: number;
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
    dateFrom: string;
    dateTo: string;
    mentions: number;
  }[];
  list: PressMention[];
}
