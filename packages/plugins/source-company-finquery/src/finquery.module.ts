import { Module } from '@nestjs/common';
import { FinQueryService } from './finquery.service';

@Module({ providers: [FinQueryService], exports: [FinQueryService] })
export class FinQueryModule {}
