import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { CourseModule } from './course/course.module.js';
import { EnrollmentModule } from './enrollment/enrollment.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { SeedModule } from './seed/seed.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 10_000 }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest_demo'),
    PrismaModule,
    AuthModule,
    UserModule,
    CourseModule,
    EnrollmentModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
