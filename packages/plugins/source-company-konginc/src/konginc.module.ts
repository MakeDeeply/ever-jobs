import { Module } from '@nestjs/common';
import { KongIncService } from './konginc.service';

@Module({ providers: [KongIncService], exports: [KongIncService] })
export class KongIncModule {}
