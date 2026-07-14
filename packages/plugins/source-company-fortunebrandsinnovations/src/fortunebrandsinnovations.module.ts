import { Module } from '@nestjs/common';
import { FortuneBrandsInnovationsService } from './fortunebrandsinnovations.service';

@Module({ providers: [FortuneBrandsInnovationsService], exports: [FortuneBrandsInnovationsService] })
export class FortuneBrandsInnovationsModule {}
