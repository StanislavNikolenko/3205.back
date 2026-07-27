import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobStatus } from './types/url-job';
import { randomUUID } from 'crypto';

@Injectable()
export class JobsService {
  private readonly jobs = new Map<string, Job>();

  public create(createJobDto: CreateJobDto) {
    const job: Job = {
      id: randomUUID(),
      status: 'pending',
      urls: createJobDto.urls,
      results: createJobDto.urls.map((url) => ({
        url,
        status: 'pending' as const,
      })),
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    void this.run(job.id);

    return { jobId: job.id, status: 'pending' };
  }

  private async run(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'in_progress' as JobStatus;

    const CONCURRENCY = 5;

    try {
      for (let start = 0; start < job.urls.length; start += CONCURRENCY) {
        if (job.status === 'cancelled') break;

        const slice = job.urls.slice(start, start + CONCURRENCY);

        await Promise.all(
          slice.map(async (url, offset) => {
            const i = start + offset;
            const item = job.results[i];

            item.status = 'in_progress';
            item.startedAt = new Date();

            try {
              const res = await fetch(url, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000),
              });

              const delayMs = Math.floor(Math.random() * 10001);
              await new Promise((resolve) => setTimeout(resolve, delayMs));

              item.httpStatusCode = res.status;
              item.status = 'success';
            } catch (e) {
              item.status = 'error';
              item.error = e instanceof Error ? e.message : 'Unknown error';
            }
            item.finishedAt = new Date();
            item.durationMs =
              item.finishedAt.getTime() - item.startedAt.getTime();
          }),
        );
      }
      if (job.status !== 'cancelled') {
        job.status = 'completed';
      }
    } catch {
      job.status = 'failed';
    } finally {
      if (!job.finishedAt) {
        job.finishedAt = new Date();
      }
    }
  }

  public getAllJobs() {
    const jobs = Array.from(this.jobs.values());
    return jobs.map((job) => {
      const { urlSuccessCount, urlErrorCount } = this.getJobStats(job);
      return {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        urlCount: job.urls.length,
        urlSuccessCount,
        urlErrorCount,
      };
    });
  }

  public getById(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const { urlSuccessCount, urlErrorCount } = this.getJobStats(job);

    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      urlCount: job.urls.length,
      urlSuccessCount,
      urlErrorCount,
      results: job.results,
    };
  }

  public cancelJobById(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    if (
      job.status === 'completed' ||
      job.status === 'failed' ||
      job.status === 'cancelled'
    ) {
      throw new BadRequestException(
        `Job ${job.id} is already ${job.status} and cannot be cancelled`,
      );
    }

    job.status = 'cancelled';
    job.finishedAt = new Date();

    for (const item of job.results) {
      if (item.status === 'pending') {
        item.status = 'cancelled';
      }
    }
    return { jobId: job.id, status: job.status };
  }

  private getJobStats(job: Job) {
    return {
      urlSuccessCount: job.results.filter((r) => r.status === 'success').length,
      urlErrorCount: job.results.filter((r) => r.status === 'error').length,
    };
  }
}
