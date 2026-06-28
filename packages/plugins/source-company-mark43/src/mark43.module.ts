import { Module } from '@nestjs/common';
import { Mark43Service } from './mark43.service';

@Module({ providers: [Mark43Service], exports: [Mark43Service] })
export class Mark43Module {}
