import { Module } from '@nestjs/common';
import { ScalableCapitalService } from './scalablecapital.service';

@Module({ providers: [ScalableCapitalService], exports: [ScalableCapitalService] })
export class ScalableCapitalModule {}
