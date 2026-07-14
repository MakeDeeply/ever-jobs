import { Module } from '@nestjs/common';
import { RenuityService } from './renuity.service';

@Module({ providers: [RenuityService], exports: [RenuityService] })
export class RenuityModule {}
