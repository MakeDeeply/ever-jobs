import { Module } from '@nestjs/common';
import { TENEXAIService } from './tenexai.service';

@Module({ providers: [TENEXAIService], exports: [TENEXAIService] })
export class TENEXAIModule {}
