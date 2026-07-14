import { Module } from '@nestjs/common';
import { RenesasElectronicsService } from './renesaselectronics.service';

@Module({ providers: [RenesasElectronicsService], exports: [RenesasElectronicsService] })
export class RenesasElectronicsModule {}
