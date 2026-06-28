import { Module } from '@nestjs/common';
import { HyperproofService } from './hyperproof.service';

@Module({ providers: [HyperproofService], exports: [HyperproofService] })
export class HyperproofModule {}
