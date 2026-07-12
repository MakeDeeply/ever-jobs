import { Module } from '@nestjs/common';
import { JGWentworthHomeLendingService } from './jgwentworthhomelending.service';

@Module({ providers: [JGWentworthHomeLendingService], exports: [JGWentworthHomeLendingService] })
export class JGWentworthHomeLendingModule {}
