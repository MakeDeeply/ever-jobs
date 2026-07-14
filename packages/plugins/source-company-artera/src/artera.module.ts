import { Module } from '@nestjs/common';
import { ArteraService } from './artera.service';

@Module({ providers: [ArteraService], exports: [ArteraService] })
export class ArteraModule {}
