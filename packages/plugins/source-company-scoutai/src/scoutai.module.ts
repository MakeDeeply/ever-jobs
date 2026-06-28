import { Module } from '@nestjs/common';
import { ScoutAIService } from './scoutai.service';

@Module({ providers: [ScoutAIService], exports: [ScoutAIService] })
export class ScoutAIModule {}
