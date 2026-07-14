import { Module } from '@nestjs/common';
import { XsollaService } from './xsolla.service';

@Module({ providers: [XsollaService], exports: [XsollaService] })
export class XsollaModule {}
