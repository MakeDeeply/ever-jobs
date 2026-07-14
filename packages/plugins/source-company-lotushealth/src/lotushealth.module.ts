import { Module } from '@nestjs/common';
import { LotusHealthService } from './lotushealth.service';

@Module({ providers: [LotusHealthService], exports: [LotusHealthService] })
export class LotusHealthModule {}
