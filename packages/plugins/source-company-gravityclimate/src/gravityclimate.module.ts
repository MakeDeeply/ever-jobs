import { Module } from '@nestjs/common';
import { GravityClimateService } from './gravityclimate.service';

@Module({ providers: [GravityClimateService], exports: [GravityClimateService] })
export class GravityClimateModule {}
