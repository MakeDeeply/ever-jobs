import { Module } from '@nestjs/common';
import { TapcartService } from './tapcart.service';

@Module({ providers: [TapcartService], exports: [TapcartService] })
export class TapcartModule {}
