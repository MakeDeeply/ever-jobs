import { Module } from '@nestjs/common';
import { SaronicTechnologiesService } from './saronictechnologies.service';

@Module({ providers: [SaronicTechnologiesService], exports: [SaronicTechnologiesService] })
export class SaronicTechnologiesModule {}
