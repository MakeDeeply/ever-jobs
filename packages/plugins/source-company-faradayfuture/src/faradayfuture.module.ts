import { Module } from '@nestjs/common';
import { FaradayFutureService } from './faradayfuture.service';

@Module({ providers: [FaradayFutureService], exports: [FaradayFutureService] })
export class FaradayFutureModule {}
