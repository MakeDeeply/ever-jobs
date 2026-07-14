import { Module } from '@nestjs/common';
import { TrueZeroTechnologiesService } from './truezerotech.service';

@Module({ providers: [TrueZeroTechnologiesService], exports: [TrueZeroTechnologiesService] })
export class TrueZeroTechnologiesModule {}
