import { Module } from '@nestjs/common';
import { VardaSpaceIndustriesService } from './vardaspace.service';

@Module({ providers: [VardaSpaceIndustriesService], exports: [VardaSpaceIndustriesService] })
export class VardaSpaceIndustriesModule {}
