import { Module } from '@nestjs/common';
import { ArrayLabsService } from './arraylabsio.service';

@Module({ providers: [ArrayLabsService], exports: [ArrayLabsService] })
export class ArrayLabsModule {}
