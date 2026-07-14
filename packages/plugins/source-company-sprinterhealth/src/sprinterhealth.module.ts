import { Module } from '@nestjs/common';
import { SprinterHealthService } from './sprinterhealth.service';

@Module({ providers: [SprinterHealthService], exports: [SprinterHealthService] })
export class SprinterHealthModule {}
