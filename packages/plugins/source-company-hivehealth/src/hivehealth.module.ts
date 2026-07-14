import { Module } from '@nestjs/common';
import { HiveHealthService } from './hivehealth.service';

@Module({ providers: [HiveHealthService], exports: [HiveHealthService] })
export class HiveHealthModule {}
