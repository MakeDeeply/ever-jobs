import { Module } from '@nestjs/common';
import { TRMLabsService } from './trmlabs.service';

@Module({ providers: [TRMLabsService], exports: [TRMLabsService] })
export class TRMLabsModule {}
