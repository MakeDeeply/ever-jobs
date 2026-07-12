import { Module } from '@nestjs/common';
import { WesternDigitalService } from './westerndigital.service';

@Module({ providers: [WesternDigitalService], exports: [WesternDigitalService] })
export class WesternDigitalModule {}
