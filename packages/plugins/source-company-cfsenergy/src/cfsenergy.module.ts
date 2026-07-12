import { Module } from '@nestjs/common';
import { CommonwealthFusionSystemsService } from './cfsenergy.service';

@Module({ providers: [CommonwealthFusionSystemsService], exports: [CommonwealthFusionSystemsService] })
export class CommonwealthFusionSystemsModule {}
