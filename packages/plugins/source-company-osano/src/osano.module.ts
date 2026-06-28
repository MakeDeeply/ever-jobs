import { Module } from '@nestjs/common';
import { OsanoService } from './osano.service';

@Module({ providers: [OsanoService], exports: [OsanoService] })
export class OsanoModule {}
