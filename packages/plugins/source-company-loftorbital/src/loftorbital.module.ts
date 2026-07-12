import { Module } from '@nestjs/common';
import { LoftOrbitalSolutionsService } from './loftorbital.service';

@Module({ providers: [LoftOrbitalSolutionsService], exports: [LoftOrbitalSolutionsService] })
export class LoftOrbitalSolutionsModule {}
