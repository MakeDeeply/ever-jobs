import { Module } from '@nestjs/common';
import { AtomicMachinesService } from './atomicmachines.service';

@Module({ providers: [AtomicMachinesService], exports: [AtomicMachinesService] })
export class AtomicMachinesModule {}
