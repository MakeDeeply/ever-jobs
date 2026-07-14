import { Module } from '@nestjs/common';
import { VTechSolutionService } from './vtechsolution.service';

@Module({ providers: [VTechSolutionService], exports: [VTechSolutionService] })
export class VTechSolutionModule {}
