import { Module } from '@nestjs/common';
import { FrontierTechnologiesService } from './frontiertechnologies.service';

@Module({ providers: [FrontierTechnologiesService], exports: [FrontierTechnologiesService] })
export class FrontierTechnologiesModule {}
