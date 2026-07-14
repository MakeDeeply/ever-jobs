import { Module } from '@nestjs/common';
import { SwordHealthService } from './swordhealth.service';

@Module({ providers: [SwordHealthService], exports: [SwordHealthService] })
export class SwordHealthModule {}
