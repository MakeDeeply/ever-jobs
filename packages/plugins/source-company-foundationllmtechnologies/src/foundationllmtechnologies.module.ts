import { Module } from '@nestjs/common';
import { FoundationEGIService } from './foundationllmtechnologies.service';

@Module({ providers: [FoundationEGIService], exports: [FoundationEGIService] })
export class FoundationEGIModule {}
