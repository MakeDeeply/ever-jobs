import { Module } from '@nestjs/common';
import { MoonPayService } from './moonpay.service';

@Module({ providers: [MoonPayService], exports: [MoonPayService] })
export class MoonPayModule {}
