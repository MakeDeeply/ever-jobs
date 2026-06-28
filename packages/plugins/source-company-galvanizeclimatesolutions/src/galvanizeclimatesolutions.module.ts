import { Module } from '@nestjs/common';
import { GalvanizeClimateSolutionsService } from './galvanizeclimatesolutions.service';

@Module({ providers: [GalvanizeClimateSolutionsService], exports: [GalvanizeClimateSolutionsService] })
export class GalvanizeClimateSolutionsModule {}
