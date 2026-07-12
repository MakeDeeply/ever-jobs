import { Module } from '@nestjs/common';
import { MindRoboticsService } from './mindrobotics.service';

@Module({ providers: [MindRoboticsService], exports: [MindRoboticsService] })
export class MindRoboticsModule {}
