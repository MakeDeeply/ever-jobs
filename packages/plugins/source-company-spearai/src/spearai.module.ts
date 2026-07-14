import { Module } from '@nestjs/common';
import { SpearAIService } from './spearai.service';

@Module({ providers: [SpearAIService], exports: [SpearAIService] })
export class SpearAIModule {}
