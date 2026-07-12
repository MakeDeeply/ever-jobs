import { Module } from '@nestjs/common';
import { TruewerkService } from './truewerk.service';

@Module({ providers: [TruewerkService], exports: [TruewerkService] })
export class TruewerkModule {}
