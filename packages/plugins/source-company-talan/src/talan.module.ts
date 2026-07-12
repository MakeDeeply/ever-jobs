import { Module } from '@nestjs/common';
import { TalanService } from './talan.service';

@Module({ providers: [TalanService], exports: [TalanService] })
export class TalanModule {}
