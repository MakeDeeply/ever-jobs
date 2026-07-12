import { Module } from '@nestjs/common';
import { BCforwardService } from './bcforward.service';

@Module({ providers: [BCforwardService], exports: [BCforwardService] })
export class BCforwardModule {}
