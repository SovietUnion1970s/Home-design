import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(email: string, password: string, role?: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN'): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    validateToken(payload: any): Promise<{
        id: string;
        email: string;
        password: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    validateSocialUser(profile: any): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
