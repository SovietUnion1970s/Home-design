import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Google OAuth ───────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: express.Request) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateSocialUser(req.user);
    return res.redirect(`http://localhost:5173/auth/callback?token=${result.token}`);
  }

  // ─── Facebook OAuth ─────────────────────────────────────────────
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() _req: express.Request) {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: express.Request, @Res() res: express.Response) {
    const result = await this.authService.validateSocialUser(req.user);
    return res.redirect(`http://localhost:5173/auth/callback?token=${result.token}`);
  }

  // ─── Local Auth ─────────────────────────────────────────────────
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.registerLocal(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.loginLocal(body);
  }
}

