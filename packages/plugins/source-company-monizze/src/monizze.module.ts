import { Module } from '@nestjs/common';
import { MonizzeService } from './monizze.service';

@Module({ providers: [MonizzeService], exports: [MonizzeService] })
export class MonizzeModule {}
