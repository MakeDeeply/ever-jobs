import { Module } from '@nestjs/common';
import { TorcRoboticsService } from './torcrobotics.service';

@Module({ providers: [TorcRoboticsService], exports: [TorcRoboticsService] })
export class TorcRoboticsModule {}
