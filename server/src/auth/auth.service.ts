import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, role?: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN') {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, role: role || 'HOMEOWNER' },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.password) throw new UnauthorizedException('Please log in with your social account');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async validateToken(payload: any) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }

  async validateSocialUser(profile: any) {
    const { email, firstName, lastName, picture } = profile;
    
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar: picture,
          role: 'HOMEOWNER',
        },
      });
    } else {
      // Update existing user with latest social info if needed
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          avatar: user.avatar || picture,
        },
      });
    }

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
