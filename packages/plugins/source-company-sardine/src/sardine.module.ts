import { Module } from '@nestjs/common';
import { SardineService } from './sardine.service';

@Module({ providers: [SardineService], exports: [SardineService] })
export class SardineModule {}
