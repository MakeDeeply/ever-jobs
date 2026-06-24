import { Module } from '@nestjs/common';
import { NewselaService } from './newsela.service';

@Module({ providers: [NewselaService], exports: [NewselaService] })
export class NewselaModule {}
