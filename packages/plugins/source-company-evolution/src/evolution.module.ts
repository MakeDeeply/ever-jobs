import { Module } from '@nestjs/common';
import { EvolutionService } from './evolution.service';

@Module({ providers: [EvolutionService], exports: [EvolutionService] })
export class EvolutionModule {}
