import { Module } from '@nestjs/common';
import { GenBioAIService } from './genbio.service';

@Module({ providers: [GenBioAIService], exports: [GenBioAIService] })
export class GenBioAIModule {}
