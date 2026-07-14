import { Module } from '@nestjs/common';
import { UP42Service } from './up42.service';

@Module({ providers: [UP42Service], exports: [UP42Service] })
export class UP42Module {}
