import { Module } from '@nestjs/common';
import { LendbuzzService } from './lendbuzz.service';

@Module({ providers: [LendbuzzService], exports: [LendbuzzService] })
export class LendbuzzModule {}
