import { Module } from '@nestjs/common';
import { ArriveLogisticsService } from './arrivelogistics.service';

@Module({ providers: [ArriveLogisticsService], exports: [ArriveLogisticsService] })
export class ArriveLogisticsModule {}
