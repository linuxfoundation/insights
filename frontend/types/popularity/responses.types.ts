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
