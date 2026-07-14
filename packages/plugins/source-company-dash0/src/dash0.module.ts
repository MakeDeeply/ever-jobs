import { Module } from '@nestjs/common';
import { Dash0Service } from './dash0.service';

@Module({ providers: [Dash0Service], exports: [Dash0Service] })
export class Dash0Module {}
