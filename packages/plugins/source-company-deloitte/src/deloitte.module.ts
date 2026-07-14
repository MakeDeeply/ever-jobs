import { Module } from '@nestjs/common';
import { DeloitteService } from './deloitte.service';

@Module({ providers: [DeloitteService], exports: [DeloitteService] })
export class DeloitteModule {}
