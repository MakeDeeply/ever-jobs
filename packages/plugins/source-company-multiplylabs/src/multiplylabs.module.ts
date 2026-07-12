import { Module } from '@nestjs/common';
import { MultiplyLabsService } from './multiplylabs.service';

@Module({ providers: [MultiplyLabsService], exports: [MultiplyLabsService] })
export class MultiplyLabsModule {}
