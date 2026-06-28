import { Module } from '@nestjs/common';
import { IntrinsicService } from './intrinsicrobotics.service';

@Module({ providers: [IntrinsicService], exports: [IntrinsicService] })
export class IntrinsicModule {}
