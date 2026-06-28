import { Module } from '@nestjs/common';
import { ZuoraService } from './zuora.service';

@Module({ providers: [ZuoraService], exports: [ZuoraService] })
export class ZuoraModule {}
