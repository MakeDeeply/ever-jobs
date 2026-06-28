import { Module } from '@nestjs/common';
import { ExigerService } from './exiger.service';

@Module({ providers: [ExigerService], exports: [ExigerService] })
export class ExigerModule {}
