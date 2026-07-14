import { Module } from '@nestjs/common';
import { XplorTechnologiesService } from './xplortechnologies.service';

@Module({ providers: [XplorTechnologiesService], exports: [XplorTechnologiesService] })
export class XplorTechnologiesModule {}
