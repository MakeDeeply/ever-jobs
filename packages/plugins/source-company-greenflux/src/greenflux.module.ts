import { Module } from '@nestjs/common';
import { GreenFluxService } from './greenflux.service';

@Module({ providers: [GreenFluxService], exports: [GreenFluxService] })
export class GreenFluxModule {}
