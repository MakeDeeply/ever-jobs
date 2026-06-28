import { Module } from '@nestjs/common';
import { SESAIService } from './sesai.service';

@Module({ providers: [SESAIService], exports: [SESAIService] })
export class SESAIModule {}
