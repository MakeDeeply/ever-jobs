import { Module } from '@nestjs/common';
import { ANYboticsService } from './anybotics.service';

@Module({ providers: [ANYboticsService], exports: [ANYboticsService] })
export class ANYboticsModule {}
