import { Module } from '@nestjs/common';
import { K2SpaceService } from './k2spacecorporation.service';

@Module({ providers: [K2SpaceService], exports: [K2SpaceService] })
export class K2SpaceModule {}
