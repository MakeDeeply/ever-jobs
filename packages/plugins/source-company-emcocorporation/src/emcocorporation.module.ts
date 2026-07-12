import { Module } from '@nestjs/common';
import { EMCOCorporationService } from './emcocorporation.service';

@Module({ providers: [EMCOCorporationService], exports: [EMCOCorporationService] })
export class EMCOCorporationModule {}
