import { Module } from '@nestjs/common';
import { PrijsvrijVakantiesService } from './prijsvrijvakanties.service';

@Module({ providers: [PrijsvrijVakantiesService], exports: [PrijsvrijVakantiesService] })
export class PrijsvrijVakantiesModule {}
