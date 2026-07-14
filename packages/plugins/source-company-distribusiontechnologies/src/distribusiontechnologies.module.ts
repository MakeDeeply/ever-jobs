import { Module } from '@nestjs/common';
import { DistribusionTechnologiesService } from './distribusiontechnologies.service';

@Module({ providers: [DistribusionTechnologiesService], exports: [DistribusionTechnologiesService] })
export class DistribusionTechnologiesModule {}
