import { Module } from '@nestjs/common';
import { AvalereHealthService } from './avalerehealth.service';

@Module({ providers: [AvalereHealthService], exports: [AvalereHealthService] })
export class AvalereHealthModule {}
