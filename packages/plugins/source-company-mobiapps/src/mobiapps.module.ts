import { Module } from '@nestjs/common';
import { MobiappsService } from './mobiapps.service';

@Module({ providers: [MobiappsService], exports: [MobiappsService] })
export class MobiappsModule {}
