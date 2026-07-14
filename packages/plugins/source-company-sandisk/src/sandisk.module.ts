import { Module } from '@nestjs/common';
import { SanDiskService } from './sandisk.service';

@Module({ providers: [SanDiskService], exports: [SanDiskService] })
export class SanDiskModule {}
