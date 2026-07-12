import { Module } from '@nestjs/common';
import { SocureService } from './socure.service';

@Module({ providers: [SocureService], exports: [SocureService] })
export class SocureModule {}
