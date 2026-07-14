import { Module } from '@nestjs/common';
import { LaurelService } from './laurel.service';

@Module({ providers: [LaurelService], exports: [LaurelService] })
export class LaurelModule {}
