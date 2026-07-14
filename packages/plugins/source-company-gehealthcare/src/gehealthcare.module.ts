import { Module } from '@nestjs/common';
import { GEHealthCareService } from './gehealthcare.service';

@Module({ providers: [GEHealthCareService], exports: [GEHealthCareService] })
export class GEHealthCareModule {}
