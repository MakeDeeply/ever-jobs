import { Module } from '@nestjs/common';
import { NetspendService } from './netspend.service';

@Module({ providers: [NetspendService], exports: [NetspendService] })
export class NetspendModule {}
