import { Module } from '@nestjs/common';
import { VersapayService } from './versapay.service';

@Module({ providers: [VersapayService], exports: [VersapayService] })
export class VersapayModule {}
