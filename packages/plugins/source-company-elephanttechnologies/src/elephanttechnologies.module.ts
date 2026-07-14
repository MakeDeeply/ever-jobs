import { Module } from '@nestjs/common';
import { ElephantTechnologiesService } from './elephanttechnologies.service';

@Module({ providers: [ElephantTechnologiesService], exports: [ElephantTechnologiesService] })
export class ElephantTechnologiesModule {}
