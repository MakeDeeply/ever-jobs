import { Module } from '@nestjs/common';
import { PeripassService } from './peripass.service';

@Module({ providers: [PeripassService], exports: [PeripassService] })
export class PeripassModule {}
