import { Module } from '@nestjs/common';
import { CertiKService } from './certik.service';

@Module({ providers: [CertiKService], exports: [CertiKService] })
export class CertiKModule {}
