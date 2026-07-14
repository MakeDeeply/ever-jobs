import { Module } from '@nestjs/common';
import { Healthtech1Service } from './healthtech1.service';

@Module({ providers: [Healthtech1Service], exports: [Healthtech1Service] })
export class Healthtech1Module {}
