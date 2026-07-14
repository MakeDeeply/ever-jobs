import { Module } from '@nestjs/common';
import { BannerBankService } from './bannerbank.service';

@Module({ providers: [BannerBankService], exports: [BannerBankService] })
export class BannerBankModule {}
