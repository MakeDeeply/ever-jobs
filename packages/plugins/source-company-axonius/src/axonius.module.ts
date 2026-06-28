import { Module } from '@nestjs/common';
import { AxoniusService } from './axonius.service';

@Module({ providers: [AxoniusService], exports: [AxoniusService] })
export class AxoniusModule {}
