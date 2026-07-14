import { Module } from '@nestjs/common';
import { VertuozaService } from './vertuoza.service';

@Module({ providers: [VertuozaService], exports: [VertuozaService] })
export class VertuozaModule {}
