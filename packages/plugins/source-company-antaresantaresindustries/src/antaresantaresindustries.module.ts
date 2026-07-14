import { Module } from '@nestjs/common';
import { AntaresAntaresIndustriesService } from './antaresantaresindustries.service';

@Module({ providers: [AntaresAntaresIndustriesService], exports: [AntaresAntaresIndustriesService] })
export class AntaresAntaresIndustriesModule {}
