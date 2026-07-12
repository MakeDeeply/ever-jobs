import { Module } from '@nestjs/common';
import { FoundryRoboticsService } from './foundryrobotics.service';

@Module({ providers: [FoundryRoboticsService], exports: [FoundryRoboticsService] })
export class FoundryRoboticsModule {}
