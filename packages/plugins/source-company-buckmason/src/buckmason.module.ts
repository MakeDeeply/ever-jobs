import { Module } from '@nestjs/common';
import { BuckMasonService } from './buckmason.service';

@Module({ providers: [BuckMasonService], exports: [BuckMasonService] })
export class BuckMasonModule {}
