import { Module } from '@nestjs/common';
import { TenableService } from './tenableinc.service';

@Module({ providers: [TenableService], exports: [TenableService] })
export class TenableModule {}
