import { Module } from '@nestjs/common';
import { MateraService } from './matera.service';

@Module({ providers: [MateraService], exports: [MateraService] })
export class MateraModule {}
