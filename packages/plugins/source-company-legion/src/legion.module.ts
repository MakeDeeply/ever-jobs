import { Module } from '@nestjs/common';
import { LegionTechnologiesService } from './legion.service';

@Module({ providers: [LegionTechnologiesService], exports: [LegionTechnologiesService] })
export class LegionTechnologiesModule {}
