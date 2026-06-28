import { Module } from '@nestjs/common';
import { MobilityWareService } from './mobilityware.service';

@Module({ providers: [MobilityWareService], exports: [MobilityWareService] })
export class MobilityWareModule {}
