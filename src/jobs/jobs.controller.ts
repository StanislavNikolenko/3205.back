import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getById(id);
  }

  @Delete(':id')
  cancelJob(@Param('id') id: string) {
    return this.jobsService.cancelJobById(id);
  }
}
