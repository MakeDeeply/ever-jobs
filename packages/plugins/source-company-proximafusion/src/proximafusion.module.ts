import { Module } from '@nestjs/common';
import { ProximaFusionService } from './proximafusion.service';

@Module({ providers: [ProximaFusionService], exports: [ProximaFusionService] })
export class ProximaFusionModule {}
