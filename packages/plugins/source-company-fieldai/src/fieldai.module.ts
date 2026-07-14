import { Module } from '@nestjs/common';
import { FieldAIService } from './fieldai.service';

@Module({ providers: [FieldAIService], exports: [FieldAIService] })
export class FieldAIModule {}
