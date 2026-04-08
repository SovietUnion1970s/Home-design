import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrUpdate(data: any, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue | null;
        ownerId: string;
    }>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue | null;
        ownerId: string;
    } | null>;
    findAllByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue | null;
        ownerId: string;
    }[]>;
}
