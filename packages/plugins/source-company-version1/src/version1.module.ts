import { Module } from '@nestjs/common';
import { Version1Service } from './version1.service';

@Module({ providers: [Version1Service], exports: [Version1Service] })
export class Version1Module {}
