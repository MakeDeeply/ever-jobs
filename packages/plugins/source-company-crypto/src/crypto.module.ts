import { Module } from '@nestjs/common';
import { CryptoComService } from './crypto.service';

@Module({ providers: [CryptoComService], exports: [CryptoComService] })
export class CryptoComModule {}
