import { Module } from '@nestjs/common';
import { SigNozService } from './signoz.service';

@Module({ providers: [SigNozService], exports: [SigNozService] })
export class SigNozModule {}
