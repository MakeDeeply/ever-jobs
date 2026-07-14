import { Module } from '@nestjs/common';
import { ServeRoboticsService } from './serverobotics.service';

@Module({ providers: [ServeRoboticsService], exports: [ServeRoboticsService] })
export class ServeRoboticsModule {}
