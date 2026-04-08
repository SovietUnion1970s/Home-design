import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
  password: string;
  role?: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN';
}

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: express.Request) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateSocialUser(req.user);
    return res.redirect(`http://localhost:5173/dashboard?token=${result.token}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: express.Request) {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateSocialUser(req.user);
    return res.redirect(`http://localhost:5173/dashboard?token=${result.token}`);
  }
}
