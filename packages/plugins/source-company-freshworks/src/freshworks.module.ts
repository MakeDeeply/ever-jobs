import { Module } from '@nestjs/common';
import { FreshworksService } from './freshworks.service';

@Module({ providers: [FreshworksService], exports: [FreshworksService] })
export class FreshworksModule {}
