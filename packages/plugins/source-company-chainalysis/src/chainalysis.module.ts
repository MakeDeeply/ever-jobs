import { Module } from '@nestjs/common';
import { ChainalysisService } from './chainalysis.service';

@Module({ providers: [ChainalysisService], exports: [ChainalysisService] })
export class ChainalysisModule {}
