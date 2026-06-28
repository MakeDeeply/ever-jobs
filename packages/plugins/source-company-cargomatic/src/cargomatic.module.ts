import { Module } from '@nestjs/common';
import { CargomaticService } from './cargomatic.service';

@Module({ providers: [CargomaticService], exports: [CargomaticService] })
export class CargomaticModule {}
