import { Module } from '@nestjs/common';
import { EarnInService } from './earnin.service';

@Module({ providers: [EarnInService], exports: [EarnInService] })
export class EarnInModule {}
