import { Module } from '@nestjs/common';
import { HeartbeatHealthService } from './heartbeathealth.service';

@Module({ providers: [HeartbeatHealthService], exports: [HeartbeatHealthService] })
export class HeartbeatHealthModule {}
