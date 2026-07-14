import { Module } from '@nestjs/common';
import { GenomicsPlcService } from './genomicsplc.service';

@Module({ providers: [GenomicsPlcService], exports: [GenomicsPlcService] })
export class GenomicsPlcModule {}
