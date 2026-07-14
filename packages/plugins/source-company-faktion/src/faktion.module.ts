import { Module } from '@nestjs/common';
import { FaktionService } from './faktion.service';

@Module({ providers: [FaktionService], exports: [FaktionService] })
export class FaktionModule {}
