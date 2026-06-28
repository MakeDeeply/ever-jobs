import { Module } from '@nestjs/common';
import { SeoulRoboticsService } from './seoulrobotics.service';

@Module({ providers: [SeoulRoboticsService], exports: [SeoulRoboticsService] })
export class SeoulRoboticsModule {}
