import { Module } from '@nestjs/common';
import { AlliumService } from './allium.service';

@Module({ providers: [AlliumService], exports: [AlliumService] })
export class AlliumModule {}
