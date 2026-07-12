import { Module } from '@nestjs/common';
import { FieldNationService } from './fieldnation.service';

@Module({ providers: [FieldNationService], exports: [FieldNationService] })
export class FieldNationModule {}
