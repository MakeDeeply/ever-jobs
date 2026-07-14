import { Module } from '@nestjs/common';
import { HealthEastService } from './healtheast.service';

@Module({ providers: [HealthEastService], exports: [HealthEastService] })
export class HealthEastModule {}
