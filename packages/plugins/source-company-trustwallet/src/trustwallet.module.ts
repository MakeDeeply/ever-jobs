import { Module } from '@nestjs/common';
import { TrustWalletService } from './trustwallet.service';

@Module({ providers: [TrustWalletService], exports: [TrustWalletService] })
export class TrustWalletModule {}
