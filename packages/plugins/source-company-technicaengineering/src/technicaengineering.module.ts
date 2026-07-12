import { Module } from '@nestjs/common';
import { TechnicaEngineeringService } from './technicaengineering.service';

@Module({ providers: [TechnicaEngineeringService], exports: [TechnicaEngineeringService] })
export class TechnicaEngineeringModule {}
