import { Module } from '@nestjs/common';
import { DeloitteNordicService } from './deloittenordic.service';

@Module({ providers: [DeloitteNordicService], exports: [DeloitteNordicService] })
export class DeloitteNordicModule {}
