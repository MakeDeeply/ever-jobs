import { Module } from '@nestjs/common';
import { MediCircleService } from './medicircle.service';

@Module({ providers: [MediCircleService], exports: [MediCircleService] })
export class MediCircleModule {}
