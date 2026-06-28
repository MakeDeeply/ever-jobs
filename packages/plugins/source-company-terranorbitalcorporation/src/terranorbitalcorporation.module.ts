import { Module } from '@nestjs/common';
import { TerranOrbitalService } from './terranorbitalcorporation.service';

@Module({ providers: [TerranOrbitalService], exports: [TerranOrbitalService] })
export class TerranOrbitalModule {}
