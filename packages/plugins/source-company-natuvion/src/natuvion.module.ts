import { Module } from '@nestjs/common';
import { NatuvionService } from './natuvion.service';

@Module({ providers: [NatuvionService], exports: [NatuvionService] })
export class NatuvionModule {}
