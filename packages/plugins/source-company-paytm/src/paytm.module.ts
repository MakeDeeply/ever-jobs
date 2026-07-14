import { Module } from '@nestjs/common';
import { PaytmService } from './paytm.service';

@Module({ providers: [PaytmService], exports: [PaytmService] })
export class PaytmModule {}
