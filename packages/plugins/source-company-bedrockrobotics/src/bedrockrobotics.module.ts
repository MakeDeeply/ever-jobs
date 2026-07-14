import { Module } from '@nestjs/common';
import { BedrockRoboticsService } from './bedrockrobotics.service';

@Module({ providers: [BedrockRoboticsService], exports: [BedrockRoboticsService] })
export class BedrockRoboticsModule {}
