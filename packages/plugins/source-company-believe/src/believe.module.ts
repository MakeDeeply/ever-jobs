import { Module } from '@nestjs/common';
import { BelieveService } from './believe.service';

@Module({ providers: [BelieveService], exports: [BelieveService] })
export class BelieveModule {}
