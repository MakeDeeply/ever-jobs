import { Module } from '@nestjs/common';
import { QualifyzeService } from './qualifyze.service';

@Module({ providers: [QualifyzeService], exports: [QualifyzeService] })
export class QualifyzeModule {}
