import { Module } from '@nestjs/common';
import { PalmettoCleanTechnologyService } from './palmettocleantech.service';

@Module({ providers: [PalmettoCleanTechnologyService], exports: [PalmettoCleanTechnologyService] })
export class PalmettoCleanTechnologyModule {}
