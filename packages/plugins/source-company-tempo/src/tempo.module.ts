import { Module } from '@nestjs/common';
import { TempoService } from './tempo.service';

@Module({ providers: [TempoService], exports: [TempoService] })
export class TempoModule {}
