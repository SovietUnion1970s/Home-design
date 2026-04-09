import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createOrUpdate(@Body() projectData: any, @Request() req: any) {
    try {
      const project = await this.projectsService.createOrUpdate(projectData, req.user.userId);
      return { success: true, project };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    const projects = await this.projectsService.findAllByUser(req.user.userId);
    return { success: true, projects };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const project = await this.projectsService.findOne(id, req.user.userId);
    if (!project) return { success: false, message: 'Dự án không tồn tại' };
    return { success: true, project };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      await this.projectsService.remove(id, req.user.userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}
