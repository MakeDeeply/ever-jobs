import { Module } from '@nestjs/common';
import { MobilityPlusService } from './mobilityplus.service';

@Module({ providers: [MobilityPlusService], exports: [MobilityPlusService] })
export class MobilityPlusModule {}
