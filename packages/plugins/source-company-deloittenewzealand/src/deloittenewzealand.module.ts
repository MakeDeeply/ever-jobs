import { Module } from '@nestjs/common';
import { DeloitteNewZealandService } from './deloittenewzealand.service';

@Module({ providers: [DeloitteNewZealandService], exports: [DeloitteNewZealandService] })
export class DeloitteNewZealandModule {}
