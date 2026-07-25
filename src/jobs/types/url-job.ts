export type JobStatus =
  'pending' | 'running' | 'completed' | 'cancelled' | 'failed';

export type UrlResult = {
  url: string;
  ok: boolean;
  statusCode?: number;
  error?: string;
};

export type Job = {
  id: string;
  status: JobStatus;
  urls: string[];
  results: UrlResult[];
  createdAt: Date;
  finishedAt?: Date;
};
