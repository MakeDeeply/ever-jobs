import { Module } from '@nestjs/common';
import { AllegisGlobalSolutionsService } from './allegisglobalsolutions.service';

@Module({ providers: [AllegisGlobalSolutionsService], exports: [AllegisGlobalSolutionsService] })
export class AllegisGlobalSolutionsModule {}
