import { Module } from '@nestjs/common';
import { SukiAIService } from './suki.service';

@Module({ providers: [SukiAIService], exports: [SukiAIService] })
export class SukiAIModule {}
