import { Module } from '@nestjs/common';
import { PSLogisticsService } from './pslogistics.service';

@Module({ providers: [PSLogisticsService], exports: [PSLogisticsService] })
export class PSLogisticsModule {}
