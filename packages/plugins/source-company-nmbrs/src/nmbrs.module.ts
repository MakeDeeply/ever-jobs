import { Module } from '@nestjs/common';
import { NmbrsService } from './nmbrs.service';

@Module({ providers: [NmbrsService], exports: [NmbrsService] })
export class NmbrsModule {}
