import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import {
  JobIdStatusResponse,
  JobDetailsResponse,
  JobSummary,
} from './types/url-job';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@Body() createJobDto: CreateJobDto): JobIdStatusResponse {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  getAllJobs(): JobSummary[] {
    return this.jobsService.getAllJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string): JobDetailsResponse {
    return this.jobsService.getById(id);
  }

  @Delete(':id')
  cancelJob(@Param('id') id: string): JobIdStatusResponse {
    return this.jobsService.cancelJobById(id);
  }
}
