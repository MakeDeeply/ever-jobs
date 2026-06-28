import { Module } from '@nestjs/common';
import { ITSLogisticsService } from './itslogisticsllc.service';

@Module({ providers: [ITSLogisticsService], exports: [ITSLogisticsService] })
export class ITSLogisticsModule {}
