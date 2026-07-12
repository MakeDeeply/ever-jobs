import { Module } from '@nestjs/common';
import { ShawSService } from './shaws.service';

@Module({ providers: [ShawSService], exports: [ShawSService] })
export class ShawSModule {}
