import { Module } from '@nestjs/common';
import { SuperellipseService } from './superellipse.service';

@Module({ providers: [SuperellipseService], exports: [SuperellipseService] })
export class SuperellipseModule {}
