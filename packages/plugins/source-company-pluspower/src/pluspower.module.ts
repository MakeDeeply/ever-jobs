import { Module } from '@nestjs/common';
import { PlusPowerService } from './pluspower.service';

@Module({ providers: [PlusPowerService], exports: [PlusPowerService] })
export class PlusPowerModule {}
