import { Module } from '@nestjs/common';
import { AirNewZealandService } from './airnewzealand.service';

@Module({ providers: [AirNewZealandService], exports: [AirNewZealandService] })
export class AirNewZealandModule {}
