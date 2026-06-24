import { Module } from '@nestjs/common';
import { FlatironHealthService } from './flatironhealth.service';

@Module({ providers: [FlatironHealthService], exports: [FlatironHealthService] })
export class FlatironHealthModule {}
