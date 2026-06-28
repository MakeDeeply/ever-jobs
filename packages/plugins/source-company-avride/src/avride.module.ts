import { Module } from '@nestjs/common';
import { AvrideService } from './avride.service';

@Module({ providers: [AvrideService], exports: [AvrideService] })
export class AvrideModule {}
