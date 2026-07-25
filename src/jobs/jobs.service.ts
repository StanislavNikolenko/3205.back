import { Injectable } from '@nestjs/common';
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
      results: [],
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    void this.run(job.id);

    return { jobId: job.id, status: job.status };
  }

  private async run(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'running';

    try {
      for (const url of job.urls) {
        try {
          const res = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
          });

          const delayMs = Math.floor(Math.random() * 10001);
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          job.results.push({ url, ok: res.ok, statusCode: res.status });
        } catch (e) {
          job.results.push({
            url,
            ok: false,
            error: e instanceof Error ? e.message : 'Unknown error',
          });
        }
      }
      job.status = 'completed';
    } catch {
      job.status = 'failed';
    } finally {
      job.finishedAt = new Date();
    }
  }
}
