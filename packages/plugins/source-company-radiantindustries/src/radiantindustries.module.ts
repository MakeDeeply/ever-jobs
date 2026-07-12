import { Module } from '@nestjs/common';
import { RadiantIndustriesService } from './radiantindustries.service';

@Module({ providers: [RadiantIndustriesService], exports: [RadiantIndustriesService] })
export class RadiantIndustriesModule {}
