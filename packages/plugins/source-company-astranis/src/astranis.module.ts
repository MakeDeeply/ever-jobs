import { Module } from '@nestjs/common';
import { AstranisService } from './astranis.service';

@Module({ providers: [AstranisService], exports: [AstranisService] })
export class AstranisModule {}
