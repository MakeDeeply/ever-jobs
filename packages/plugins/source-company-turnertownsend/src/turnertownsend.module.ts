import { Module } from '@nestjs/common';
import { TurnerTownsendService } from './turnertownsend.service';

@Module({ providers: [TurnerTownsendService], exports: [TurnerTownsendService] })
export class TurnerTownsendModule {}
