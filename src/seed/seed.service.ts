import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bycrypt from 'bcrypt';
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.seed();
  }

  async seed() {
    const isSeeded = await this.isSeeded();
    if (!isSeeded) {
      const adminUser = {
        firstName: 'Admin',
        lastName: 'Manager',
        role: UserRole.ADMIN,
        password: await bycrypt.hash('Password123', 10),
        email: 'admin@lms.local',
        username: 'admin123',
      };
      await this.prisma.user.create({
        data: adminUser,
      });
      console.log('Admin Seeded Successfully....');
    }
  }

  async isSeeded() {
    const isExist = await this.prisma.user.findFirst({
      where: {
        username: 'admin123',
      },
    });
    if (isExist) {
      return true;
    } else {
      return false;
    }
  }
}
