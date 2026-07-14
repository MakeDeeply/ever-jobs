import { Module } from '@nestjs/common';
import { SecfixService } from './secfix.service';

@Module({ providers: [SecfixService], exports: [SecfixService] })
export class SecfixModule {}
