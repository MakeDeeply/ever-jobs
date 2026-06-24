import { Module } from '@nestjs/common';
import { CarbonRoboticsService } from './carbonrobotics.service';

@Module({ providers: [CarbonRoboticsService], exports: [CarbonRoboticsService] })
export class CarbonRoboticsModule {}
