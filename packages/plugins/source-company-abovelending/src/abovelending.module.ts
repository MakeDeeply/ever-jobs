import { Module } from '@nestjs/common';
import { AboveLendingService } from './abovelending.service';

@Module({ providers: [AboveLendingService], exports: [AboveLendingService] })
export class AboveLendingModule {}
