import { Module } from '@nestjs/common';
import { ZyngaService } from './zyngacareers.service';

@Module({ providers: [ZyngaService], exports: [ZyngaService] })
export class ZyngaModule {}
