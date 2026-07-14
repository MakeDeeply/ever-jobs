import { Module } from '@nestjs/common';
import { ProfortoService } from './proforto.service';

@Module({ providers: [ProfortoService], exports: [ProfortoService] })
export class ProfortoModule {}
