import { Module } from '@nestjs/common';
import { RelayRoboticsService } from './relayroboticscom.service';

@Module({ providers: [RelayRoboticsService], exports: [RelayRoboticsService] })
export class RelayRoboticsModule {}
