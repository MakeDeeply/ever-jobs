import { Module } from '@nestjs/common';
import { WealthfrontService } from './wealthfront.service';

@Module({ providers: [WealthfrontService], exports: [WealthfrontService] })
export class WealthfrontModule {}
