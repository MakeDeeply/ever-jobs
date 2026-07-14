import { Module } from '@nestjs/common';
import { CobaltRoboticsService } from './cobaltrobotics.service';

@Module({ providers: [CobaltRoboticsService], exports: [CobaltRoboticsService] })
export class CobaltRoboticsModule {}
