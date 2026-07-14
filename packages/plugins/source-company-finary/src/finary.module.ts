import { Module } from '@nestjs/common';
import { FinaryService } from './finary.service';

@Module({ providers: [FinaryService], exports: [FinaryService] })
export class FinaryModule {}
