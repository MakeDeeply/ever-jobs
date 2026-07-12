import { Module } from '@nestjs/common';
import { CircadiaHealthService } from './circadiahealth.service';

@Module({ providers: [CircadiaHealthService], exports: [CircadiaHealthService] })
export class CircadiaHealthModule {}
