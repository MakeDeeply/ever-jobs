import { Module } from '@nestjs/common';
import { TrustedShopsService } from './trustedshops.service';

@Module({ providers: [TrustedShopsService], exports: [TrustedShopsService] })
export class TrustedShopsModule {}
