import { Module } from '@nestjs/common';
import { PrimeLendingService } from './primelending.service';

@Module({ providers: [PrimeLendingService], exports: [PrimeLendingService] })
export class PrimeLendingModule {}
