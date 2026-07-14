import { Module } from '@nestjs/common';
import { HealthPartnersService } from './healthpartners.service';

@Module({ providers: [HealthPartnersService], exports: [HealthPartnersService] })
export class HealthPartnersModule {}
