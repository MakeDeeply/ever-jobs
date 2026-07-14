import { Module } from '@nestjs/common';
import { MachIndustriesService } from './machindustries.service';

@Module({ providers: [MachIndustriesService], exports: [MachIndustriesService] })
export class MachIndustriesModule {}
