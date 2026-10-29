import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { RegisterDto } from '../auth/dto/register.dto.js';
import { User, UserRole } from '../generated/prisma/client.js';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  getAllUsers() {
    const users = this.prisma.user.findMany({
      omit: {
        password: true,
      },
    });
    return users;
  }
  async createUser(registerData: RegisterDto) {
    return await this.authService.register(registerData);
  }

  async updateUser(id: number, user: User, updateData: UpdateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!existUser && user.role == UserRole.ADMIN) {
      throw new NotFoundException('User not found');
    }
    if (
      (user.role == UserRole.ADMIN && existUser) ||
      (user.id == id && existUser)
    ) {
      const newUserData = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: updateData,
        omit: {
          password: true,
        },
      });
      return newUserData;
    } else {
      throw new ForbiddenException('you are not able to update this student');
    }
  }
}
