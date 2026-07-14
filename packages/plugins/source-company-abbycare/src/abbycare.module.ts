import { Module } from '@nestjs/common';
import { AbbyCareService } from './abbycare.service';

@Module({ providers: [AbbyCareService], exports: [AbbyCareService] })
export class AbbyCareModule {}
