import { Module } from '@nestjs/common';
import { ShiftTechnologyService } from './shifttechnology.service';

@Module({ providers: [ShiftTechnologyService], exports: [ShiftTechnologyService] })
export class ShiftTechnologyModule {}
