import { Module } from '@nestjs/common';
import { ON2ITService } from './on2it.service';

@Module({ providers: [ON2ITService], exports: [ON2ITService] })
export class ON2ITModule {}
