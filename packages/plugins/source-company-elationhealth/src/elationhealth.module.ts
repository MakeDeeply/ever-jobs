import { Module } from '@nestjs/common';
import { ElationHealthService } from './elationhealth.service';

@Module({ providers: [ElationHealthService], exports: [ElationHealthService] })
export class ElationHealthModule {}
