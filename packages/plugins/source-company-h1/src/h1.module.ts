import { Module } from '@nestjs/common';
import { H1Service } from './h1.service';

@Module({ providers: [H1Service], exports: [H1Service] })
export class H1Module {}
