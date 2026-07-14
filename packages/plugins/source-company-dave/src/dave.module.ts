import { Module } from '@nestjs/common';
import { DaveService } from './dave.service';

@Module({ providers: [DaveService], exports: [DaveService] })
export class DaveModule {}
