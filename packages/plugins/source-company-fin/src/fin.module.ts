import { Module } from '@nestjs/common';
import { FinService } from './fin.service';

@Module({ providers: [FinService], exports: [FinService] })
export class FinModule {}
