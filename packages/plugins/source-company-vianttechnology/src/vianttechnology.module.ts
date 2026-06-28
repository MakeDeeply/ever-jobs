import { Module } from '@nestjs/common';
import { ViantTechnologyService } from './vianttechnology.service';

@Module({ providers: [ViantTechnologyService], exports: [ViantTechnologyService] })
export class ViantTechnologyModule {}
