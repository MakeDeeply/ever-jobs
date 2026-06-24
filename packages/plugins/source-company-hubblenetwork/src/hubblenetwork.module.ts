import { Module } from '@nestjs/common';
import { HubbleNetworkService } from './hubblenetwork.service';

@Module({ providers: [HubbleNetworkService], exports: [HubbleNetworkService] })
export class HubbleNetworkModule {}
