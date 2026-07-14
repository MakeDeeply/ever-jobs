import { Module } from '@nestjs/common';
import { MonteCarloService } from './montecarlo.service';

@Module({ providers: [MonteCarloService], exports: [MonteCarloService] })
export class MonteCarloModule {}
