import { Module } from '@nestjs/common';
import { IntersectPowerService } from './intersect.service';

@Module({ providers: [IntersectPowerService], exports: [IntersectPowerService] })
export class IntersectPowerModule {}
