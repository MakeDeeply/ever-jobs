import { Module } from '@nestjs/common';
import { TastytradeService } from './tastytrade.service';

@Module({ providers: [TastytradeService], exports: [TastytradeService] })
export class TastytradeModule {}
