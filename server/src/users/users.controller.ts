import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    // req.user is populated by JwtAuthGuard via Passport
    const userId = req.user.id || req.user.sub || req.user.userId;
    return this.usersService.updateMe(userId, body);
  }
}
