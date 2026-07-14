import { Module } from '@nestjs/common';
import { HONKService } from './honkforhelp.service';

@Module({ providers: [HONKService], exports: [HONKService] })
export class HONKModule {}
