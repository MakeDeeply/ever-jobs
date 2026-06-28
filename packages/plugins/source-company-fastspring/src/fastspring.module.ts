import { Module } from '@nestjs/common';
import { FastSpringService } from './fastspring.service';

@Module({ providers: [FastSpringService], exports: [FastSpringService] })
export class FastSpringModule {}
