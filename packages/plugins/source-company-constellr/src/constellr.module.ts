import { Module } from '@nestjs/common';
import { ConstellrService } from './constellr.service';

@Module({ providers: [ConstellrService], exports: [ConstellrService] })
export class ConstellrModule {}
