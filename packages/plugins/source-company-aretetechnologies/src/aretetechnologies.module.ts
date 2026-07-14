import { Module } from '@nestjs/common';
import { AreteTechnologiesService } from './aretetechnologies.service';

@Module({ providers: [AreteTechnologiesService], exports: [AreteTechnologiesService] })
export class AreteTechnologiesModule {}
