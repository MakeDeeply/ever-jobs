import { Module } from '@nestjs/common';
import { ReliableRoboticsService } from './reliablerobotics.service';

@Module({ providers: [ReliableRoboticsService], exports: [ReliableRoboticsService] })
export class ReliableRoboticsModule {}
