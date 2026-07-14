import { Module } from '@nestjs/common';
import { FinniHealthService } from './finnihealth.service';

@Module({ providers: [FinniHealthService], exports: [FinniHealthService] })
export class FinniHealthModule {}
