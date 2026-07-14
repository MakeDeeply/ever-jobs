import { Module } from '@nestjs/common';
import { PolymarketService } from './polymarket.service';

@Module({ providers: [PolymarketService], exports: [PolymarketService] })
export class PolymarketModule {}
