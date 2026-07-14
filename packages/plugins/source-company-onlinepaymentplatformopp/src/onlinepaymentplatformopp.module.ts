import { Module } from '@nestjs/common';
import { OnlinePaymentPlatformOPPService } from './onlinepaymentplatformopp.service';

@Module({ providers: [OnlinePaymentPlatformOPPService], exports: [OnlinePaymentPlatformOPPService] })
export class OnlinePaymentPlatformOPPModule {}
