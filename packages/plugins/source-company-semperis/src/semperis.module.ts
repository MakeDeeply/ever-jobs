import { Module } from '@nestjs/common';
import { SemperisService } from './semperis.service';

@Module({ providers: [SemperisService], exports: [SemperisService] })
export class SemperisModule {}
