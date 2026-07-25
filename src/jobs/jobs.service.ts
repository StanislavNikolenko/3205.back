import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './types/url-job';
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

    job.status = 'in_progress';

    try {
      for (let i = 0; i < job.urls.length; i++) {
        const url = job.urls[i];
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
        item.durationMs = item.finishedAt.getTime() - item.startedAt.getTime();
      }
      job.status = 'completed';
    } catch {
      job.status = 'failed';
    } finally {
      job.finishedAt = new Date();
    }
  }

  public getAllJobs() {
    const jobs = Array.from(this.jobs.values());
    const result = jobs.map((job) => {
      const urlSuccessCount = job.results.filter(
        (r) => r.status === 'success',
      ).length;
      const urlErrorCount = job.results.filter(
        (r) => r.status === 'error',
      ).length;

      return {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        urlCount: job.urls.length,
        urlSuccessCount,
        urlErrorCount,
      };
    });
    return result;
  }

  public getById(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    return job.results;
  }
}
