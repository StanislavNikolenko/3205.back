import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  urls: string[];
}
