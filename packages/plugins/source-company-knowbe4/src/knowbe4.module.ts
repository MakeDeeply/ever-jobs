import { Module } from '@nestjs/common';
import { KnowBe4Service } from './knowbe4.service';

@Module({ providers: [KnowBe4Service], exports: [KnowBe4Service] })
export class KnowBe4Module {}
