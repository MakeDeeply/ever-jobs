import { Module } from '@nestjs/common';
import { GoodLeapService } from './goodleap.service';

@Module({ providers: [GoodLeapService], exports: [GoodLeapService] })
export class GoodLeapModule {}
