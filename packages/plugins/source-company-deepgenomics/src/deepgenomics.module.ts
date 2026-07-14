import { Module } from '@nestjs/common';
import { DeepGenomicsService } from './deepgenomics.service';

@Module({ providers: [DeepGenomicsService], exports: [DeepGenomicsService] })
export class DeepGenomicsModule {}
