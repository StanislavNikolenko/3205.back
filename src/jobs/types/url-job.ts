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

export type JobIdStatusResponse = {
  jobId: string;
  status: JobStatus;
};

export type JobSummary = {
  id: string;
  status: JobStatus;
  createdAt: Date;
  urlCount: number;
  urlSuccessCount: number;
  urlErrorCount: number;
};

export type JobDetailsResponse = JobSummary & {
  results: UrlResult[];
};

export type JobStats = {
  urlSuccessCount: number;
  urlErrorCount: number;
};
