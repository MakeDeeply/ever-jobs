import { Module } from '@nestjs/common';
import { LindusHealthService } from './lindushealth.service';

@Module({ providers: [LindusHealthService], exports: [LindusHealthService] })
export class LindusHealthModule {}
