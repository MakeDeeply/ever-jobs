import { Module } from '@nestjs/common';
import { KnixService } from './knix.service';

@Module({ providers: [KnixService], exports: [KnixService] })
export class KnixModule {}
