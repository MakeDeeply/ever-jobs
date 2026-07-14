import { Module } from '@nestjs/common';
import { InfStonesService } from './infstones.service';

@Module({ providers: [InfStonesService], exports: [InfStonesService] })
export class InfStonesModule {}
