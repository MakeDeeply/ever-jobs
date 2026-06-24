import { Module } from '@nestjs/common';
import { DynoTherapeuticsService } from './dynotherapeutics.service';

@Module({ providers: [DynoTherapeuticsService], exports: [DynoTherapeuticsService] })
export class DynoTherapeuticsModule {}
