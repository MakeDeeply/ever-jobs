import { Module } from '@nestjs/common';
import { PalantirTechnologiesService } from './palantir.service';

@Module({ providers: [PalantirTechnologiesService], exports: [PalantirTechnologiesService] })
export class PalantirTechnologiesModule {}
