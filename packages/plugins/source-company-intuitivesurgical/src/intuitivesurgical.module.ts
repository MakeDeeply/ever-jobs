import { Module } from '@nestjs/common';
import { IntuitiveSurgicalService } from './intuitivesurgical.service';

@Module({ providers: [IntuitiveSurgicalService], exports: [IntuitiveSurgicalService] })
export class IntuitiveSurgicalModule {}
