import { Module } from '@nestjs/common';
import { AnalyticPartnersService } from './analyticpartners.service';

@Module({ providers: [AnalyticPartnersService], exports: [AnalyticPartnersService] })
export class AnalyticPartnersModule {}
