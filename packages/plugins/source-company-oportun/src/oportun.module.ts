import { Module } from '@nestjs/common';
import { OportunService } from './oportun.service';

@Module({ providers: [OportunService], exports: [OportunService] })
export class OportunModule {}
