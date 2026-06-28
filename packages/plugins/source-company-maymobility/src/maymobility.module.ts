import { Module } from '@nestjs/common';
import { MayMobilityService } from './maymobility.service';

@Module({ providers: [MayMobilityService], exports: [MayMobilityService] })
export class MayMobilityModule {}
