import { Module } from '@nestjs/common';
import { ZapierService } from './zapier.service';

@Module({ providers: [ZapierService], exports: [ZapierService] })
export class ZapierModule {}
