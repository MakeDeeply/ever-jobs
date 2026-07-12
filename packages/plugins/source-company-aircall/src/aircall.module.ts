import { Module } from '@nestjs/common';
import { AircallService } from './aircall.service';

@Module({ providers: [AircallService], exports: [AircallService] })
export class AircallModule {}
