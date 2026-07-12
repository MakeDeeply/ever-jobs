import { Module } from '@nestjs/common';
import { VattenfallService } from './vattenfall.service';

@Module({ providers: [VattenfallService], exports: [VattenfallService] })
export class VattenfallModule {}
