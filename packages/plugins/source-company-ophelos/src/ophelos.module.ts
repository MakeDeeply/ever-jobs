import { Module } from '@nestjs/common';
import { OphelosService } from './ophelos.service';

@Module({ providers: [OphelosService], exports: [OphelosService] })
export class OphelosModule {}
