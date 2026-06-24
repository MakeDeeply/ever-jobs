import { Module } from '@nestjs/common';
import { SilaNanotechnologiesService } from './silananotechnologies.service';

@Module({ providers: [SilaNanotechnologiesService], exports: [SilaNanotechnologiesService] })
export class SilaNanotechnologiesModule {}
