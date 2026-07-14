import { Module } from '@nestjs/common';
import { AntaresIndustriesService } from './antaresindustries.service';

@Module({ providers: [AntaresIndustriesService], exports: [AntaresIndustriesService] })
export class AntaresIndustriesModule {}
