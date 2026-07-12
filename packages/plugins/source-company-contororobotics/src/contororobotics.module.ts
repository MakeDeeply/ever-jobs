import { Module } from '@nestjs/common';
import { ContoroRoboticsService } from './contororobotics.service';

@Module({ providers: [ContoroRoboticsService], exports: [ContoroRoboticsService] })
export class ContoroRoboticsModule {}
