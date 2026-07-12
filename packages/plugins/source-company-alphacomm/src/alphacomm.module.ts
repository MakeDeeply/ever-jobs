import { Module } from '@nestjs/common';
import { AlphacommService } from './alphacomm.service';

@Module({ providers: [AlphacommService], exports: [AlphacommService] })
export class AlphacommModule {}
