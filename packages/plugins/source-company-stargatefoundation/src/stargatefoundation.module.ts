import { Module } from '@nestjs/common';
import { StargateFoundationService } from './stargatefoundation.service';

@Module({ providers: [StargateFoundationService], exports: [StargateFoundationService] })
export class StargateFoundationModule {}
