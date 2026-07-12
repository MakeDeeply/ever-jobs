import { Module } from '@nestjs/common';
import { TelefNicaTechService } from './telefnicatech.service';

@Module({ providers: [TelefNicaTechService], exports: [TelefNicaTechService] })
export class TelefNicaTechModule {}
