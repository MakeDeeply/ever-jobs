import { Module } from '@nestjs/common';
import { KomodoHealthService } from './komodohealth.service';

@Module({ providers: [KomodoHealthService], exports: [KomodoHealthService] })
export class KomodoHealthModule {}
