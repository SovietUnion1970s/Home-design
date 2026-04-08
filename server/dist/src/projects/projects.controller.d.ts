import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    createOrUpdate(projectData: any, req: any): Promise<{
        success: boolean;
        project: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue | null;
            ownerId: string;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        project?: undefined;
    }>;
    findAll(req: any): Promise<{
        success: boolean;
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue | null;
            ownerId: string;
        }[];
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        project?: undefined;
    } | {
        success: boolean;
        project: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue | null;
            ownerId: string;
        };
        message?: undefined;
    }>;
}
