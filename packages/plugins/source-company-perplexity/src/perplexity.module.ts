import { Module } from '@nestjs/common';
import { PerplexityService } from './perplexity.service';

@Module({ providers: [PerplexityService], exports: [PerplexityService] })
export class PerplexityModule {}
