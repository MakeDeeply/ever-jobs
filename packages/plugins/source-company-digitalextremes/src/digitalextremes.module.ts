import { Module } from '@nestjs/common';
import { DigitalExtremesService } from './digitalextremes.service';

@Module({ providers: [DigitalExtremesService], exports: [DigitalExtremesService] })
export class DigitalExtremesModule {}
