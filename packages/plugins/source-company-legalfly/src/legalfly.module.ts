import { Module } from '@nestjs/common';
import { LegalFlyService } from './legalfly.service';

@Module({ providers: [LegalFlyService], exports: [LegalFlyService] })
export class LegalFlyModule {}
