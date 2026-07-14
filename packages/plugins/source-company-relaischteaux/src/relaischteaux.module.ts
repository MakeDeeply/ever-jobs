import { Module } from '@nestjs/common';
import { RelaisChTeauxService } from './relaischteaux.service';

@Module({ providers: [RelaisChTeauxService], exports: [RelaisChTeauxService] })
export class RelaisChTeauxModule {}
