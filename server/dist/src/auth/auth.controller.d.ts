import * as express from 'express';
import { AuthService } from './auth.service';
declare class RegisterDto {
    email: string;
    password: string;
    role?: 'HOMEOWNER' | 'CONTRACTOR' | 'ADMIN';
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    googleAuth(req: express.Request): Promise<void>;
    googleAuthRedirect(req: express.Request, res: express.Response): Promise<void>;
    facebookAuth(req: express.Request): Promise<void>;
    facebookAuthRedirect(req: express.Request, res: express.Response): Promise<void>;
}
export {};
