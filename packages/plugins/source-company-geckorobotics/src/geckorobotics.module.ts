import { Module } from '@nestjs/common';
import { GeckoRoboticsService } from './geckorobotics.service';

@Module({ providers: [GeckoRoboticsService], exports: [GeckoRoboticsService] })
export class GeckoRoboticsModule {}
