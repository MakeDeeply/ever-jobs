import { Module } from '@nestjs/common';
import { ASAPPService } from './asapp2.service';

@Module({ providers: [ASAPPService], exports: [ASAPPService] })
export class ASAPPModule {}
