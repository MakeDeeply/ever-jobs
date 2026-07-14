import { Module } from '@nestjs/common';
import { EatalyService } from './eataly.service';

@Module({ providers: [EatalyService], exports: [EatalyService] })
export class EatalyModule {}
