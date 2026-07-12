import { Module } from '@nestjs/common';
import { SeniorPlcService } from './seniorplc.service';

@Module({ providers: [SeniorPlcService], exports: [SeniorPlcService] })
export class SeniorPlcModule {}
