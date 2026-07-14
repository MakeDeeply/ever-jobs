import { Module } from '@nestjs/common';
import { BasetenService } from './baseten.service';

@Module({ providers: [BasetenService], exports: [BasetenService] })
export class BasetenModule {}
