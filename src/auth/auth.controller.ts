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
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { CurrentUser } from '../common/decorator/index.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('/register')
  register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getMyProfile(@CurrentUser('id') userId: number) {
    return this.authService.getMyProfile(userId);
  }
}
