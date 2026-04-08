import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProjectsModule, PrismaModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
