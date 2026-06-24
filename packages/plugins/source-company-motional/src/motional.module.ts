import { Module } from '@nestjs/common';
import { MotionalService } from './motional.service';

@Module({ providers: [MotionalService], exports: [MotionalService] })
export class MotionalModule {}
