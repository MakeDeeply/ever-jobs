import { Module } from '@nestjs/common';
import { MetropolisTechnologiesService } from './metropolis.service';

@Module({ providers: [MetropolisTechnologiesService], exports: [MetropolisTechnologiesService] })
export class MetropolisTechnologiesModule {}
