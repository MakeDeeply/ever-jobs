import { Module } from '@nestjs/common';
import { AuroraSolarService } from './aurorasolar.service';

@Module({ providers: [AuroraSolarService], exports: [AuroraSolarService] })
export class AuroraSolarModule {}
