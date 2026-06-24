import { Module } from '@nestjs/common';
import { ButterflyNetworkService } from './butterflynetwork.service';

@Module({ providers: [ButterflyNetworkService], exports: [ButterflyNetworkService] })
export class ButterflyNetworkModule {}
