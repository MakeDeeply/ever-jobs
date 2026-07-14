import { Module } from '@nestjs/common';
import { WatchGuardTechnologiesService } from './watchguard.service';

@Module({ providers: [WatchGuardTechnologiesService], exports: [WatchGuardTechnologiesService] })
export class WatchGuardTechnologiesModule {}
