import { Module } from '@nestjs/common';
import { HarmattanAIService } from './harmattanai.service';

@Module({ providers: [HarmattanAIService], exports: [HarmattanAIService] })
export class HarmattanAIModule {}
