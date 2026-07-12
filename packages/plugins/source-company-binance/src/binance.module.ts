import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';

@Module({ providers: [BinanceService], exports: [BinanceService] })
export class BinanceModule {}
