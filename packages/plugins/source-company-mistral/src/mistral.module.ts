import { Module } from '@nestjs/common';
import { MistralAIService } from './mistral.service';

@Module({ providers: [MistralAIService], exports: [MistralAIService] })
export class MistralAIModule {}
