import { Module } from '@nestjs/common';
import { DeutscheTelekomITSolutionsSlovakiaService } from './deutschetelekomitsolutionsslovakia.service';

@Module({ providers: [DeutscheTelekomITSolutionsSlovakiaService], exports: [DeutscheTelekomITSolutionsSlovakiaService] })
export class DeutscheTelekomITSolutionsSlovakiaModule {}
