import { Module } from '@nestjs/common';
import { KIPPService } from './kipp.service';

@Module({ providers: [KIPPService], exports: [KIPPService] })
export class KIPPModule {}
