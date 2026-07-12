import { Module } from '@nestjs/common';
import { AristaNetworksService } from './aristanetworks.service';

@Module({ providers: [AristaNetworksService], exports: [AristaNetworksService] })
export class AristaNetworksModule {}
