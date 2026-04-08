import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(data: any, userId: string) {
    // 1. Check if updating an existing project
    if (data.id) {
      const existing = await this.prisma.project.findUnique({
        where: { id: data.id }
      });
      if (!existing) throw new NotFoundException('Project not found');
      
      // Ownership check
      if (existing.ownerId !== userId) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa dự án này');
      }

      return this.prisma.project.update({
        where: { id: data.id },
        data: {
          name: data.name || 'Untitled Project',
          designData: data.designData,
        },
      });
    }

    // 2. Create new project with current user as owner
    return this.prisma.project.create({
      data: {
        name: data.name || 'Dự án mới',
        designData: data.designData || {},
        ownerId: userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    
    if (!project) return null;
    
    // Privacy check — only owner can see (unless the user is an ADMIN, but keep it simple for now)
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem dự án này');
    }
    
    return project;
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
