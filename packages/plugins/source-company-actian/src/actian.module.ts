import { Module } from '@nestjs/common';
import { ActianService } from './actian.service';

@Module({ providers: [ActianService], exports: [ActianService] })
export class ActianModule {}
