import { Module } from '@nestjs/common';
import { CruisePlannersService } from './cruiseplanners.service';

@Module({ providers: [CruisePlannersService], exports: [CruisePlannersService] })
export class CruisePlannersModule {}
