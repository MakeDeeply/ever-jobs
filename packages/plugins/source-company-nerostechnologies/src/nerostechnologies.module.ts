import { Module } from '@nestjs/common';
import { NerosTechnologiesService } from './nerostechnologies.service';

@Module({ providers: [NerosTechnologiesService], exports: [NerosTechnologiesService] })
export class NerosTechnologiesModule {}
