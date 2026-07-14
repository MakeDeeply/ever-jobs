import { Module } from '@nestjs/common';
import { ChargeRoboticsService } from './chargerobotics.service';

@Module({ providers: [ChargeRoboticsService], exports: [ChargeRoboticsService] })
export class ChargeRoboticsModule {}
