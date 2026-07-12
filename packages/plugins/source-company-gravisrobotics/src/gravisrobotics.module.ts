import { Module } from '@nestjs/common';
import { GravisRoboticsService } from './gravisrobotics.service';

@Module({ providers: [GravisRoboticsService], exports: [GravisRoboticsService] })
export class GravisRoboticsModule {}
