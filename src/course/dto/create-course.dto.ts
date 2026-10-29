import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CourseStatus } from '../../generated/prisma/enums.js';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsEnum(CourseStatus)
  status: CourseStatus;

 
}
