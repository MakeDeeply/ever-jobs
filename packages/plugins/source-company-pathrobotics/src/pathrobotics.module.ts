import { Module } from '@nestjs/common';
import { PathRoboticsService } from './pathrobotics.service';

@Module({ providers: [PathRoboticsService], exports: [PathRoboticsService] })
export class PathRoboticsModule {}
