import { Module } from '@nestjs/common';
import { CrusoeService } from './crusoe.service';

@Module({ providers: [CrusoeService], exports: [CrusoeService] })
export class CrusoeModule {}
