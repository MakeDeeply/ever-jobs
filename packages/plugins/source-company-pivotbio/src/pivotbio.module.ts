import { Module } from '@nestjs/common';
import { PivotBioService } from './pivotbio.service';

@Module({ providers: [PivotBioService], exports: [PivotBioService] })
export class PivotBioModule {}
