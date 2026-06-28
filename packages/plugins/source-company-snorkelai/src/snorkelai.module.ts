import { Module } from '@nestjs/common';
import { SnorkelAIService } from './snorkelai.service';

@Module({ providers: [SnorkelAIService], exports: [SnorkelAIService] })
export class SnorkelAIModule {}
