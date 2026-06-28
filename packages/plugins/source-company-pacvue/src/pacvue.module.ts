import { Module } from '@nestjs/common';
import { PacvueService } from './pacvue.service';

@Module({ providers: [PacvueService], exports: [PacvueService] })
export class PacvueModule {}
