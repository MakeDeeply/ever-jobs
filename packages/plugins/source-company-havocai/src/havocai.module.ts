import { Module } from '@nestjs/common';
import { HavocAIService } from './havocai.service';

@Module({ providers: [HavocAIService], exports: [HavocAIService] })
export class HavocAIModule {}
