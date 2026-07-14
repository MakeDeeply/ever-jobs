import { Module } from '@nestjs/common';
import { LyraHealthService } from './lyrahealth.service';

@Module({ providers: [LyraHealthService], exports: [LyraHealthService] })
export class LyraHealthModule {}
