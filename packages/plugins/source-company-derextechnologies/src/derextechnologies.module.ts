import { Module } from '@nestjs/common';
import { DerexTechnologiesService } from './derextechnologies.service';

@Module({ providers: [DerexTechnologiesService], exports: [DerexTechnologiesService] })
export class DerexTechnologiesModule {}
