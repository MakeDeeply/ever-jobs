import { Module } from '@nestjs/common';
import { LocusRoboticsService } from './locusrobotics.service';

@Module({ providers: [LocusRoboticsService], exports: [LocusRoboticsService] })
export class LocusRoboticsModule {}
