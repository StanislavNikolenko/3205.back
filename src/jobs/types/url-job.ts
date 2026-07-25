export type JobStatus =
  'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export type UrlStatus =
  'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

export type UrlResult = {
  url: string;
  status: UrlStatus;
  httpStatusCode?: number;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
};

export type Job = {
  id: string;
  status: JobStatus;
  urls: string[];
  results: UrlResult[];
  createdAt: Date;
  finishedAt?: Date;
};
