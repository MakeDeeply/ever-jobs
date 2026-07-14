import { Module } from '@nestjs/common';
import { LinearService } from './linear.service';

@Module({ providers: [LinearService], exports: [LinearService] })
export class LinearModule {}
