import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { User, UserRole } from '../generated/prisma/client.js';
import { PaginationDto } from './dto/search.dto.js';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schema/course.scheme.js';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

  async getAll(){
    const course=await this.courseModel.find();
  }



  async create(createCourseDto: CreateCourseDto, teacherId: number) {
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        teacherId,
      },
    });
    return course;
  }

  async findAll(query: PaginationDto) {
    const key = 'get-courses';
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'id',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            {
              description: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const orderBy = {
      id: { id: sortOrder },
      title: { title: sortOrder },
      description: { description: sortOrder },
      status: { status: sortOrder },
    }[sortBy] ?? { id: 'desc' as const };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        // skip,
        // take: limit,
        // orderBy,
        include: {
          teacher: true,
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const key = `course:${id}`;
    const cached = await this.cache.get(key);
    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS');

    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        teacher: true,
      },
    });
    if (course) await this.cache.set(key, course);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, user: User) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (
      (course && user.role == UserRole.ADMIN) ||
      (course && user.id == course.teacherId)
    ) {
      const newCourse = await this.prisma.course.update({
        where: {
          id,
        },
        data: updateCourseDto,
      });
      return newCourse;
    } else {
      throw new ForbiddenException(
        'you are not able to update this course because it is not your own',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }

  setImage(id: number, imageUrl: string) {
    return this.prisma.course.update({ where: { id }, data: { imageUrl } });
  }
}
