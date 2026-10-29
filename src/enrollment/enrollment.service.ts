import { Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}
  create(createEnrollmentDto: CreateEnrollmentDto) {
    return 'This action adds a new enrollment';
  }

}
