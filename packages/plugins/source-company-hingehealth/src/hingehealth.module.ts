import { Module } from '@nestjs/common';
import { HingeHealthService } from './hingehealth.service';

@Module({ providers: [HingeHealthService], exports: [HingeHealthService] })
export class HingeHealthModule {}
