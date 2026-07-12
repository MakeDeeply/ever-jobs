import { Module } from '@nestjs/common';
import { InstituteOfFoundationModelsService } from './ifmus.service';

@Module({ providers: [InstituteOfFoundationModelsService], exports: [InstituteOfFoundationModelsService] })
export class InstituteOfFoundationModelsModule {}
