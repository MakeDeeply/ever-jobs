import { Module } from '@nestjs/common';
import { TemporalTechnologiesService } from './temporaltechnologies.service';

@Module({ providers: [TemporalTechnologiesService], exports: [TemporalTechnologiesService] })
export class TemporalTechnologiesModule {}
