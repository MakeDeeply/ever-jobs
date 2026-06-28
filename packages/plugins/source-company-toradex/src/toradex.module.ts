import { Module } from '@nestjs/common';
import { ToradexService } from './toradex.service';

@Module({ providers: [ToradexService], exports: [ToradexService] })
export class ToradexModule {}
