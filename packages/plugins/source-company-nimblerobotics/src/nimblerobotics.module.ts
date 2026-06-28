import { Module } from '@nestjs/common';
import { NimbleRoboticsService } from './nimblerobotics.service';

@Module({ providers: [NimbleRoboticsService], exports: [NimbleRoboticsService] })
export class NimbleRoboticsModule {}
