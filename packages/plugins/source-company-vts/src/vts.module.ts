import { Module } from '@nestjs/common';
import { VTSService } from './vts.service';

@Module({ providers: [VTSService], exports: [VTSService] })
export class VTSModule {}
