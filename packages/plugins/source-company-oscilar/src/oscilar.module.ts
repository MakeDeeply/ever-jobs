import { Module } from '@nestjs/common';
import { OscilarService } from './oscilar.service';

@Module({ providers: [OscilarService], exports: [OscilarService] })
export class OscilarModule {}
