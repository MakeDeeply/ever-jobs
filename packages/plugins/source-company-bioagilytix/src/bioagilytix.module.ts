import { Module } from '@nestjs/common';
import { BioAgilytixService } from './bioagilytix.service';

@Module({ providers: [BioAgilytixService], exports: [BioAgilytixService] })
export class BioAgilytixModule {}
