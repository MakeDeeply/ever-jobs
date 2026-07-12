import { Module } from '@nestjs/common';
import { FinixService } from './finix.service';

@Module({ providers: [FinixService], exports: [FinixService] })
export class FinixModule {}
