import { Module } from '@nestjs/common';
import { AccorService } from './accor.service';

@Module({ providers: [AccorService], exports: [AccorService] })
export class AccorModule {}
