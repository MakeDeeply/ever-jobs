import { Module } from '@nestjs/common';
import { SEAKREngineeringService } from './seakrengineering.service';

@Module({ providers: [SEAKREngineeringService], exports: [SEAKREngineeringService] })
export class SEAKREngineeringModule {}
