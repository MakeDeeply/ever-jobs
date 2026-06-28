import { Module } from '@nestjs/common';
import { ThirdWaveAutomationService } from './thirdwaveautomation.service';

@Module({ providers: [ThirdWaveAutomationService], exports: [ThirdWaveAutomationService] })
export class ThirdWaveAutomationModule {}
