import { Module } from '@nestjs/common';
import { WHOOPService } from './whoop.service';

@Module({ providers: [WHOOPService], exports: [WHOOPService] })
export class WHOOPModule {}
