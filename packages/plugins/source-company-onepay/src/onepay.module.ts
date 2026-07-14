import { Module } from '@nestjs/common';
import { OnePayService } from './onepay.service';

@Module({ providers: [OnePayService], exports: [OnePayService] })
export class OnePayModule {}
