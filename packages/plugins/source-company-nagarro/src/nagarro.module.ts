import { Module } from '@nestjs/common';
import { NagarroService } from './nagarro.service';

@Module({ providers: [NagarroService], exports: [NagarroService] })
export class NagarroModule {}
