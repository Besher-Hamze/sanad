import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/role.gurad.js';
import { Roles } from '../common/decorator/role.decorator.js';
import { UserRole } from '../common/enums/index.js';
import { RegisterDto } from '../auth/dto/register.dto.js';
import { CurrentUser } from '../common/decorator/index.js';
import * as client from '../generated/prisma/client.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  getAllUser() {
    return this.userService.getAllUsers();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  createUser(@Body() registerData: CreateUserDto) {
    return this.userService.createUser(registerData);
  }
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @CurrentUser() user: client.User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(+id, user, updateUserDto);
  }
}
