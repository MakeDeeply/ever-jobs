import { Module } from '@nestjs/common';
import { IDMeService } from './idme.service';

@Module({ providers: [IDMeService], exports: [IDMeService] })
export class IDMeModule {}
