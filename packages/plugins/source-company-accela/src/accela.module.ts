import { Module } from '@nestjs/common';
import { AccelaService } from './accela.service';

@Module({ providers: [AccelaService], exports: [AccelaService] })
export class AccelaModule {}
