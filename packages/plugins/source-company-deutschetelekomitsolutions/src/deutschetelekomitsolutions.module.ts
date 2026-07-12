import { Module } from '@nestjs/common';
import { DeutscheTelekomITSolutionsService } from './deutschetelekomitsolutions.service';

@Module({ providers: [DeutscheTelekomITSolutionsService], exports: [DeutscheTelekomITSolutionsService] })
export class DeutscheTelekomITSolutionsModule {}
