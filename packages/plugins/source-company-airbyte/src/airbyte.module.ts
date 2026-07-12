import { Module } from '@nestjs/common';
import { AirbyteService } from './airbyte.service';

@Module({ providers: [AirbyteService], exports: [AirbyteService] })
export class AirbyteModule {}
