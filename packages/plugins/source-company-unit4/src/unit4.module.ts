import { Module } from '@nestjs/common';
import { Unit4Service } from './unit4.service';

@Module({ providers: [Unit4Service], exports: [Unit4Service] })
export class Unit4Module {}
