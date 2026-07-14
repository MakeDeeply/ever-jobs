import { Module } from '@nestjs/common';
import { VentiTechnologiesService } from './ventitechnologies.service';

@Module({ providers: [VentiTechnologiesService], exports: [VentiTechnologiesService] })
export class VentiTechnologiesModule {}
