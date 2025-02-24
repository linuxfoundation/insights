import type { Summary } from '~/components/shared/types/summary.types';

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

export interface PastMentions {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    mentions: number;
  }[];
}
