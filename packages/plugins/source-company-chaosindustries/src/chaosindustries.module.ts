import { Module } from '@nestjs/common';
import { CHAOSIndustriesService } from './chaosindustries.service';

@Module({ providers: [CHAOSIndustriesService], exports: [CHAOSIndustriesService] })
export class CHAOSIndustriesModule {}
