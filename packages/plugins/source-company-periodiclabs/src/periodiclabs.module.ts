import { Module } from '@nestjs/common';
import { PeriodicLabsService } from './periodiclabs.service';

@Module({ providers: [PeriodicLabsService], exports: [PeriodicLabsService] })
export class PeriodicLabsModule {}
