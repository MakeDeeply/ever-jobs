import { Module } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';

@Module({ providers: [TrendyolService], exports: [TrendyolService] })
export class TrendyolModule {}
