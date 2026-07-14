import { Module } from '@nestjs/common';
import { SynapticureService } from './synapticure.service';

@Module({ providers: [SynapticureService], exports: [SynapticureService] })
export class SynapticureModule {}
