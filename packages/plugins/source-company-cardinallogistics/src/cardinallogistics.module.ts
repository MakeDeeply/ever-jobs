import { Module } from '@nestjs/common';
import { CardinalLogisticsService } from './cardinallogistics.service';

@Module({ providers: [CardinalLogisticsService], exports: [CardinalLogisticsService] })
export class CardinalLogisticsModule {}
