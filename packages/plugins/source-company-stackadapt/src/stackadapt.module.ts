import { Module } from '@nestjs/common';
import { StackAdaptService } from './stackadapt.service';

@Module({ providers: [StackAdaptService], exports: [StackAdaptService] })
export class StackAdaptModule {}
