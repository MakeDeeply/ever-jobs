import { Module } from '@nestjs/common';
import { AndurilIndustriesService } from './andurilindustries.service';

@Module({ providers: [AndurilIndustriesService], exports: [AndurilIndustriesService] })
export class AndurilIndustriesModule {}
